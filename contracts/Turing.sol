// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Turing is ERC20, Ownable {
    address public professora;
    bool public voting;

    // Mapeamentos exigidos
    mapping(string => address) public users;
    // Mapeamento reverso para facilitar a identificação de quem está chamando a função
    mapping(address => string) public addressToCodinome; 
    
    // (Chave Primária: Eleitor) => ((Chave Secundária: Candidato) => Votou?)
    mapping(string => mapping(string => bool)) public hasVoted;
    
    // Contador de votos para a regra do "1 Turing extra a cada 10 votos"
    mapping(address => uint256) public voteCount;

    // Eventos para o Frontend capturar e atualizar o Ranking (implementação ii)
    event Voted(string indexed voter, string indexed candidate, uint256 amount);
    event TokenIssued(string indexed codinome, uint256 amount);
    event VotingStatusChanged(bool status);

    // Modifier exigido para controle de acesso do Owner e da Professora
    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == professora, "Acesso negado: Apenas owner ou professora.");
        _;
    }

    // Constructor sem minting (Uncapped Lazy Supply)
    constructor(address _professora) ERC20("Turing", "TRG") Ownable(msg.sender) {
        professora = _professora;
        
        // Tabela FAKE exemplo (Substitua pelos endereços que o Hardhat gerar para você)
        _addUser("Alice", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        _addUser("Bob", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        _addUser("Charlie", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        _addUser("Professora", _professora);
    }

    // Modificamos os decimais para 0 para facilitar o frontend (1 token = 1 Turing exato)
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    // Função auxiliar interna
    function _addUser(string memory codinome, address user_addr) internal {
        users[codinome] = user_addr;
        addressToCodinome[user_addr] = codinome;
    }

    function updateUser(string memory codinome, address user_addr) public onlyAdmin {
        require(bytes(codinome).length > 0, "Codinome nao pode ser vazio");
        _addUser(codinome, user_addr);
        
        voting = true; // Habilita votação conforme exigência
        emit VotingStatusChanged(true);
    }

    function votingOn() public onlyAdmin {
        voting = true;
        emit VotingStatusChanged(true);
    }

    function votingOff() public onlyAdmin {
        voting = false;
        emit VotingStatusChanged(false);
    }

    function issueToken(string memory codinome, uint256 qtde_de_Turings) public onlyAdmin {
        address target = users[codinome];
        require(target != address(0), "Usuario nao existe");
        
        _mint(target, qtde_de_Turings); // Minting sob demanda
        emit TokenIssued(codinome, qtde_de_Turings);
    }

    function vote(string memory codinome, uint256 qtde_de_Turings) public {
        require(voting, "Votacao pausada!");
        
        string memory voterCodinome = addressToCodinome[msg.sender];
        require(bytes(voterCodinome).length > 0, "Apenas usuarios autorizados podem votar.");
        
        address candidateAddr = users[codinome];
        require(candidateAddr != address(0), "Candidato nao existe.");
        require(msg.sender != candidateAddr, "Voce nao pode votar em si mesmo.");
        
        require(qtde_de_Turings > 0 && qtde_de_Turings <= 2, "Quantidade invalida (deve ser 1 ou 2).");
        require(!hasVoted[voterCodinome][codinome], "Voce ja votou neste codinome.");

        // Registra o voto
        hasVoted[voterCodinome][codinome] = true;
        voteCount[msg.sender] += 1;

        // Minting dos Turings para o candidato
        _mint(candidateAddr, qtde_de_Turings);
        
        // Logica de recompensa: a cada 10 votos, eleitor ganha 1 Turing
        if (voteCount[msg.sender] % 10 == 0) {
            _mint(msg.sender, 1);
        }

        emit Voted(voterCodinome, codinome, qtde_de_Turings);
    }
}