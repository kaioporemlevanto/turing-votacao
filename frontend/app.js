// Substitua pelo endereço exato gerado no seu último deploy via terminal
const contractAddress = "0x5fbdb2315678afecb367f032d93F642f64180aa3".toLowerCase();
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

// Os codinomes exatos cadastrados no contrato
const candidatos = ["nome1", "nome2", "nome3", "nome4", "nome5"]; 

async function init() {
    if (window.ethereum) {
        provider = new ethers.BrowserProvider(window.ethereum);
        
        // Recarrega a página caso o utilizador mude de conta na MetaMask
        window.ethereum.on('accountsChanged', (accounts) => {
            if (accounts.length > 0) {
                window.location.reload();
            } else {
                currentAccount = "";
                document.getElementById('status').innerText = "Status: Desconectado";
                document.getElementById('userPanel').classList.add('hidden');
                document.getElementById('adminPanel').classList.add('hidden');
            }
        });

        document.getElementById('connectBtn').onclick = async () => {
            try {
                const accounts = await provider.send("eth_requestAccounts", []);
                currentAccount = accounts[0];
                signer = await provider.getSigner();
                contract = new ethers.Contract(contractAddress, contractABI, signer);
                
                // 1. Descobre quem é o usuário
                const identidade = await identificarUsuario(currentAccount);
                
                // 2. Atualiza a interface com o NOME e o endereço encurtado
                const shortAddress = `${currentAccount.substring(0,6)}...${currentAccount.substring(38)}`;
                document.getElementById('status').innerHTML = `🟢 Conectado como <b>${identidade}</b> <span class="text-xs text-gray-400 font-mono">(${shortAddress})</span>`;
                
                document.getElementById('connectBtn').classList.add('hidden');
                document.getElementById('userPanel').classList.remove('hidden');
                
                await checkAdminStatus();
                await updateRanking();
                setupEventListeners();
                
                Swal.fire({ toast: true, position: 'top-end', icon: 'success', title: `Bem-vindo, ${identidade}!`, showConfirmButton: false, timer: 3000 });
            } catch (err) {
                console.error(err);
                Swal.fire('Erro!', 'A conexão com a carteira falhou.', 'error');
            }
        };
    } else {
        Swal.fire('MetaMask em falta', 'Por favor, instale a extensão MetaMask.', 'warning');
    }
}

async function identificarUsuario(account) {
    try {
        const owner = await contract.owner();
        const professora = await contract.professora();

        if (account.toLowerCase() === owner.toLowerCase()) return "owner (Admin)";
        if (account.toLowerCase() === professora.toLowerCase()) return "professora (Roberta)";

        // Procura se o endereço pertence a algum aluno da lista
        for (let codinome of candidatos) {
            const addr = await contract.users(codinome);
            if (addr.toLowerCase() === account.toLowerCase()) {
                return `aluno: ${codinome}`;
            }
        }
        return "Usuário Desconhecido";
    } catch (e) {
        return "Erro ao identificar";
    }
}

async function checkAdminStatus() {
    try {
        const owner = await contract.owner();
        const professora = await contract.professora();
        
        if (currentAccount.toLowerCase() === owner.toLowerCase() || 
            currentAccount.toLowerCase() === professora.toLowerCase()) {
            document.getElementById('adminPanel').classList.remove('hidden');
        } else {
            document.getElementById('adminPanel').classList.add('hidden');
        }
    } catch (e) {
        console.error("Erro ao verificar status de admin:", e);
    }
}

async function updateRanking() {
    const list = document.getElementById('rankingList');
    list.innerHTML = `<li class="text-center py-4 text-blue-500 animate-pulse">A carregar saldos da blockchain...</li>`;
    
    let saldos = [];
    for (let codinome of candidatos) {
        try {
            const addr = await contract.users(codinome);
            if(addr && addr !== "0x0000000000000000000000000000000000000000") {
                const balance = await contract.balanceOf(addr);
                saldos.push({ codinome, balance: Number(balance) });
            }
        } catch (e) { console.error(e); }
    }
    
    saldos.sort((a, b) => b.balance - a.balance);
    list.innerHTML = "";
    
    if (saldos.length === 0) {
        list.innerHTML = `<li class="text-gray-500 text-center py-4">Nenhum dado encontrado.</li>`;
        return;
    }

    saldos.forEach((item, index) => {
        const medal = index === 0 ? '🥇' : index === 1 ? '🥈' : index === 2 ? '🥉' : '🔹';
        const li = document.createElement("li");
        li.className = "flex justify-between items-center bg-gray-50 p-3 rounded-lg border border-gray-100";
        li.innerHTML = `
            <span class="font-semibold text-gray-700">${medal} ${item.codinome}</span>
            <span class="bg-blue-100 text-blue-800 py-1 px-3 rounded-full text-sm font-bold shadow-sm">${item.balance} TRG</span>
        `;
        list.appendChild(li);
    });
}

function setupEventListeners() {
    contract.on("Voted", (voter, candidate, amount) => {
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'info', title: `Novo Voto! ${voter} votou em ${candidate}`, showConfirmButton: false, timer: 4000 });
        updateRanking();
    });
    
    contract.on("TokenIssued", (codinome, amount) => {
        Swal.fire({ toast: true, position: 'bottom-end', icon: 'success', title: `${amount} TRG emitidos para ${codinome}`, showConfirmButton: false, timer: 4000 });
        updateRanking();
    });
}

// Funções de clique dos botões com tratamento de estado
document.getElementById('voteBtn').onclick = async () => {
    const btn = document.getElementById('voteBtn');
    const codinome = document.getElementById('voteCodinome').value;
    const amount = document.getElementById('voteAmount').value;
    
    try {
        btn.disabled = true;
        btn.innerText = "A processar transação...";
        const tx = await contract.vote(codinome, amount);
        await tx.wait();
        Swal.fire('Sucesso!', 'O seu voto foi registado.', 'success');
        updateRanking();
    } catch (e) { 
        Swal.fire('Erro ao votar', e.reason || e.message, 'error');
    } finally {
        btn.disabled = false;
        btn.innerText = "Confirmar Voto";
    }
};

document.getElementById('btnVotingOn').onclick = async () => {
    try {
        const tx = await contract.votingOn();
        await tx.wait();
        Swal.fire('Sucesso', 'Votação ativada!', 'success');
    } catch (e) { Swal.fire('Erro', e.reason || e.message, 'error'); }
};

document.getElementById('btnVotingOff').onclick = async () => {
    try {
        const tx = await contract.votingOff();
        await tx.wait();
        Swal.fire('Sucesso', 'Votação pausada!', 'success');
    } catch (e) { Swal.fire('Erro', e.reason || e.message, 'error'); }
};

document.getElementById('issueBtn').onclick = async () => {
    const btn = document.getElementById('issueBtn');
    const codinome = document.getElementById('issueCodinome').value;
    const amount = document.getElementById('issueAmount').value;
    try {
        btn.disabled = true;
        btn.innerText = "A emitir...";
        const tx = await contract.issueToken(codinome, amount);
        await tx.wait();
        Swal.fire('Sucesso!', 'Tokens emitidos com sucesso.', 'success');
        updateRanking();
    } catch (e) { 
        Swal.fire('Erro', e.reason || e.message, 'error'); 
    } finally {
        btn.disabled = false;
        btn.innerText = "Emitir Turings";
    }
};

init();