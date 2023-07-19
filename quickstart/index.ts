import { Axiom, AxiomConfig } from '@axiom-crypto/experimental';

async function main() {
  const config: AxiomConfig = {
    providerUri: process.env.PROVIDER_URI_GOERLI || 'http://localhost:8545',
    version: "experimental",
    chainId: 5,
    mock: true,
  }
  const ax = new Axiom(config);
}

main();