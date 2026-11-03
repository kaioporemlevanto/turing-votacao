# 🪙 DApp Turing - Sistema de Votação

Este é um Aplicativo Descentralizado (DApp) baseado em um contrato inteligente ERC-20 (Token Turing - TRG). O sistema permite a distribuição de tokens através de votação ou emissão manual, com controle de acesso rigoroso para administradores e uma interface web reativa em tempo real.

## 🚀 Funcionalidades

O sistema possui duas interfaces distintas baseadas no endereço da carteira conectada:

### 👤 Usuários Comuns (Alunos Autorizados)
* **Identificação Automática:** Ao conectar a MetaMask, o sistema reconhece quem é o aluno (ex: `nome1`, `nome2`) cruzando a carteira com o contrato.
* **Votação:** Permite votar em outros projetos (alunos) transferindo 1 ou 2 Turings.
* **Ranking ao Vivo:** Visualização do quadro de líderes atualizado em tempo real via escuta de Eventos da Blockchain (sem precisar recarregar a página).

### 👑 Superusuários (Owner e Professora - Roberta)
Possuem todas as permissões dos usuários comuns, mais o acesso automático ao **Painel de Superutilizador**, que permite:
* **Emitir Tokens (Minting Manual):** Capacidade de criar (mintar) novas moedas e enviá-las diretamente para o saldo de um aluno específico (`issueToken`).
* **Controle da Votação:** Pausar (`votingOff`) ou retomar (`votingOn`) o período de votação a qualquer momento.
* *Nota:* A professora (Roberta) foi excluída das opções de votação e emissão de tokens, não participando do ranking como competidora.

---

## 🛠️ Tecnologias Utilizadas

* **Smart Contract:** Solidity, Hardhat, OpenZeppelin (ERC-20).
* **Frontend:** HTML5, JavaScript (Ethers.js v6), Tailwind CSS (estilização) e SweetAlert2 (alertas visuais).
* **Rede:** Localhost Hardhat (Chain ID: 31337).

---

## ⚙️ Como Rodar o Projeto

Siga este passo a passo para executar o DApp localmente na sua máquina:

### 1. Iniciar a Blockchain Local
Abra um terminal na raiz do projeto e inicie o nó local do Hardhat. **Deixe este terminal aberto** o tempo todo.
```bash
npx hardhat node
```

### 2. Fazer o Deploy do Contrato
Abra um **segundo terminal** (mantenha o primeiro rodando) e faça o deploy do contrato especificando a rede local:
```bash
npx hardhat run scripts/deploy.js --network localhost
```
*Copie o endereço do contrato gerado no terminal (ex: `0x5fbdb...`).*

### 3. Configurar o Frontend
1. Vá até a pasta `frontend` e abra o arquivo `app.js`.
2. Na linha 2, cole o endereço que você copiou no passo anterior, certificando-se de deixá-lo em letras minúsculas:
```javascript
const contractAddress = "0xseu_novo_endereco_aqui_tudo_minusculo".toLowerCase();
```
3. Salve o arquivo.

### 4. Configurar a MetaMask
1. Abra a extensão da MetaMask no navegador.
2. Adicione ou selecione a rede **Localhost 8545** (Chain ID: `31337`, RPC: `http://127.0.0.1:8545`, Símbolo: `ETH`).
3. Importe uma das contas de teste fornecidas pelo terminal do Hardhat usando a chave privada.
   * *A Conta #0 geralmente é o Owner.*
   * *A Conta #1 geralmente é a Professora.*

### 5. Rodar a Interface Web
* Abra o arquivo `index.html` (dentro da pasta `frontend`) no seu navegador. Se usar o VS Code, utilize a extensão **Live Server** para melhor funcionamento.
* Pressione **Ctrl + F5** para limpar o cache do navegador e carregar o JavaScript mais recente.
* Clique em **Conectar MetaMask** e interaja com o DApp!