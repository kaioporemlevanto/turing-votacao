// SPDX-License-Identifier: MIT
pragma solidity ^0.8.20;

import "@openzeppelin/contracts/token/ERC20/ERC20.sol";
import "@openzeppelin/contracts/access/Ownable.sol";

contract Turing is ERC20, Ownable {
    address public professora;
    bool public voting = true;

    // Chave primária (string) => Endereço 
    mapping(string => address) public users;
    // Mapeamento reverso para validação do eleitor no momento do voto
    mapping(address => string) private addressToCodinome; 
    
    // Chave primária (eleitor) => (Chave Secundária (candidato) => Valor Final (bool))
    mapping(string => mapping(string => bool)) public hasVote;
    
    // Contador para bonificação extra de Turings
    mapping(address => uint256) public voteCount;

    modifier onlyAdmin() {
        require(msg.sender == owner() || msg.sender == professora, "Acesso negado: Apenas owner ou professora.");
        _;
    }

    constructor(address _professora) ERC20("Turing", "TRG") Ownable(msg.sender) {
        professora = _professora;
        
        // Inicialização do mapping com a tabela de usuários pré-autorizados
        _addUser("roberta", 0x502542668aF09fa7aea52174b9965A7799343Df7);
        _addUser("nome1", 0x70997970C51812dc3A010C7d01b50e0d17dc79C8);
        _addUser("nome2", 0x3C44CdDdB6a900fa2b585dd299e03d12FA4293BC);
        _addUser("nome3", 0x90F79bf6EB2c4f870365E785982E1f101E93b906);
        _addUser("nome4", 0x15d34AAf54267DB7D7c367839AAf71A00a2C6A65);
        _addUser("nome5", 0x9965507D1a55bcC2695C58ba16FB37d819B0A4dc);
    }

    // Decimais ajustados para zero (1 token = 1 Turing)
    function decimals() public view virtual override returns (uint8) {
        return 0;
    }

    function _addUser(string memory codinome, address user_addr) internal {
        users[codinome] = user_addr;
        addressToCodinome[user_addr] = codinome;
    }

    function updateUser(string memory codinome, address user_addr) public onlyAdmin {
        require(bytes(codinome).length > 0, "Codinome nao pode ser vazio");
        _addUser(codinome, user_addr);
    }

    function votingOn() public onlyAdmin {
        voting = true;
    }

    function votingOff() public onlyAdmin {
        voting = false;
    }

    function issueToken(string memory codinome, uint256 qtde_de_Turings) public onlyAdmin {
        address target = users[codinome];
        require(target != address(0), "Usuario nao pre-autorizado");
        
        _mint(target, qtde_de_Turings); 
    }

    function vote(string memory codinome, uint256 qtde_de_Turings) public {
        require(voting, "Votacao pausada!");
        
        string memory voterCodinome = addressToCodinome[msg.sender];
        require(bytes(voterCodinome).length > 0, "Apenas usuarios autorizados podem votar.");
        
        address candidateAddr = users[codinome];
        require(candidateAddr != address(0), "Candidato nao existe.");
        require(msg.sender != candidateAddr, "Voce nao pode votar em si mesmo.");
        
        require(qtde_de_Turings > 0 && qtde_de_Turings <= 2, "Quantidade invalida (deve ser maior que 0 e menor ou igual a 2).");
        require(!hasVote[voterCodinome][codinome], "Voce ja votou neste codinome.");

        hasVote[voterCodinome][codinome] = true;
        voteCount[msg.sender] += 1;

        _mint(candidateAddr, qtde_de_Turings);
        
        if (voteCount[msg.sender] % 10 == 0) {
            _mint(msg.sender, 1);
        }
    }
}