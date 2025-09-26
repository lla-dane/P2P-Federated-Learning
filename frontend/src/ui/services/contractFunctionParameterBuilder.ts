import { ContractFunctionParameters } from '@hashgraph/sdk';

interface BuilderParam {
  type: string;
  value: any;
}

export class ContractFunctionParameterBuilder {
  private params: BuilderParam[] = [];

  public addParam(param: BuilderParam): ContractFunctionParameterBuilder {
    this.params.push(param);
    return this;
  }

  public buildHAPIParams(): ContractFunctionParameters {
    const contractFunctionParams = new ContractFunctionParameters();
    for (const param of this.params) {
      const type = param.type.charAt(0).toUpperCase() + param.type.slice(1);
      const functionName = `add${type}`;

      if (functionName in contractFunctionParams) {
        (contractFunctionParams as any)[functionName](param.value);
      } else {
        throw new Error(`Invalid HAPI param type: ${param.type}`);
      }
    }
    return contractFunctionParams;
  }
}
