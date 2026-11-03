const hre = require("hardhat");

async function main() {
  const [owner, professora] = await hre.ethers.getSigners(); 

  console.log("Deploying contracts with the account:", owner.address);

  // Aqui ocorre a criação da Factory referenciando o nome exato "Turing"
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