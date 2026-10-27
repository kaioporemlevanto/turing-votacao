// INSIRA AQUI O ENDEREÇO GERADO NO DEPLOY
const contractAddress = "0x5FbDB2315678afecb367f032d93F642f64180aa3"; 

// INSIRA A ABI REDUZIDA AQUI (apenas o que precisamos)
const contractABI = [
    "function vote(string codinome, uint256 qtde_de_Turings) public",
    "function issueToken(string codinome, uint256 qtde_de_Turings) public",
    "function votingOn() public",
    "function votingOff() public",
    "function owner() public view returns (address)",
    "function professora() public view returns (address)",
    "function balanceOf(address account) public view returns (uint256)",
    "function users(string) public view returns (address)",
    "event Voted(string indexed voter, string indexed candidate, uint256 amount)",
    "event TokenIssued(string indexed codinome, uint256 amount)",
    "event VotingStatusChanged(bool status)"
];

let provider, signer, contract;
let currentAccount = "";

// Lista de codinomes para gerar o ranking (mock do frontend)
const candidatos = ["Alice", "Bob", "Charlie", "Professora"]; 

async function init() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        
        document.getElementById('connectBtn').onclick = async () => {
            const accounts = await provider.send("eth_requestAccounts", []);
            currentAccount = accounts[0];
            signer = await provider.getSigner();
            contract = new ethers.Contract(contractAddress, contractABI, signer);
            
            document.getElementById('status').innerText = "Status: Conectado (" + currentAccount + ")";
            document.getElementById('userPanel').classList.remove('hidden');
            
            checkAdminStatus();
            updateRanking();
            setupEventListeners();
        };
    } else {
        alert("Instale a MetaMask!");
    }
}

// Verifica se a conta conectada é owner ou professora
async function checkAdminStatus() {
    const owner = await contract.owner();
    const professora = await contract.professora();
    
    if (currentAccount.toLowerCase() === owner.toLowerCase() || 
        currentAccount.toLowerCase() === professora.toLowerCase()) {
        document.getElementById('adminPanel').classList.remove('hidden');
    } else {
        document.getElementById('adminPanel').classList.add('hidden');
    }
}

// Implementação do Ranking: pool manual inicial e atualizações por evento
async function updateRanking() {
    const list = document.getElementById('rankingList');
    list.innerHTML = ""; // limpa
    
    let saldos = [];
    for (let codinome of candidatos) {
        try {
            const addr = await contract.users(codinome);
            const balance = await contract.balanceOf(addr);
            saldos.push({ codinome, balance: Number(balance) });
        } catch (e) { console.error(e); }
    }
    
    // Ordenar por ordem decrescente de Turings
    saldos.sort((a, b) => b.balance - a.balance);
    
    saldos.forEach(item => {
        const li = document.createElement("li");
        li.innerText = `${item.codinome}: ${item.balance} Turings`;
        list.appendChild(li);
    });
}

// Escutar Eventos (Implementação "ii" exigida na atividade)
function setupEventListeners() {
    contract.on("Voted", (voter, candidate, amount) => {
        alert(`${voter} votou em ${candidate} com ${amount} Turings!`);
        updateRanking();
    });
    
    contract.on("TokenIssued", (codinome, amount) => {
        alert(`${amount} Turings emitidos para ${codinome}!`);
        updateRanking();
    });

    contract.on("VotingStatusChanged", (status) => {
        alert(status ? "A Votação foi ABERTA!" : "A Votação foi PAUSADA!");
    });
}

// Funções dos Botões (Interagindo com a Blockchain)
document.getElementById('voteBtn').onclick = async () => {
    const codinome = document.getElementById('voteCodinome').value;
    const amount = document.getElementById('voteAmount').value;
    try {
        const tx = await contract.vote(codinome, amount);
        await tx.wait();
    } catch (e) { alert("Erro ao votar: " + (e.reason || e.message)); }
};

document.getElementById('btnVotingOn').onclick = async () => {
    try { const tx = await contract.votingOn(); await tx.wait(); } catch (e) { alert(e.reason); }
};

document.getElementById('btnVotingOff').onclick = async () => {
    try { const tx = await contract.votingOff(); await tx.wait(); } catch (e) { alert(e.reason); }
};

document.getElementById('issueBtn').onclick = async () => {
    const codinome = document.getElementById('issueCodinome').value;
    const amount = document.getElementById('issueAmount').value;
    try {
        const tx = await contract.issueToken(codinome, amount);
        await tx.wait();
    } catch (e) { alert("Erro ao emitir: " + (e.reason || e.message)); }
};

init();