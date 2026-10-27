const { expect } = require("chai");
const hre = require("hardhat");

describe("Contrato Turing", function () {
  let turing;
  let owner;
  let professora;
  let addr1;
  let addr2;

  // Roda antes de cada teste: faz um novo deploy do contrato zerado
  beforeEach(async function () {
    [owner, professora, addr1, addr2] = await hre.ethers.getSigners();
    
    const Turing = await hre.ethers.getContractFactory("Turing");
    turing = await Turing.deploy(professora.address);
  });

  describe("Deploy", function () {
    it("Deve definir a professora corretamente", async function () {
      expect(await turing.professora()).to.equal(professora.address);
    });

    it("O Owner deve ser a conta que fez o deploy", async function () {
      expect(await turing.owner()).to.equal(owner.address);
    });
  });

  describe("Controle de Acesso e Votação", function () {
    it("Deve permitir que o owner ative a votação", async function () {
      await turing.connect(owner).votingOn();
      expect(await turing.voting()).to.equal(true);
    });

    it("Deve impedir que um usuario comum ative a votacao (Revert)", async function () {
      // Tenta usar a conta addr1 (que não é admin) para ligar a votação. Tem que falhar.
      await expect(
        turing.connect(addr1).votingOn()
      ).to.be.revertedWith("Acesso negado: Apenas owner ou professora.");
    });
  });
});