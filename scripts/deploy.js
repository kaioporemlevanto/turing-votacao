const hre = require("hardhat");

async function main() {
  const [owner, professora] = await hre.ethers.getSigners(); // Pegando contas do Hardhat

  console.log("Deploying contracts with the account:", owner.address);

  // Deploy do contrato passando o endereço da professora
  const Turing = await hre.ethers.getContractFactory("Turing");
  const turing = await Turing.deploy(professora.address);

  await turing.waitForDeployment();

  console.log("Token Turing deploy realizado no endereço:", await turing.getAddress());
  console.log("Conta Owner:", owner.address);
  console.log("Conta Professora:", professora.address);
}

main().catch((error) => {
  console.error(error);
  process.exitCode = 1;
});