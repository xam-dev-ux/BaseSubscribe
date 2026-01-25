import { ethers, JsonRpcProvider } from 'ethers'
import { config } from './config'

export class GasMonitor {
  private provider: JsonRpcProvider

  constructor(provider: JsonRpcProvider) {
    this.provider = provider
  }

  async getCurrentGasPrice(): Promise<bigint> {
    const feeData = await this.provider.getFeeData()
    return feeData.gasPrice || BigInt(0)
  }

  async getGasPriceGwei(): Promise<number> {
    const gasPrice = await this.getCurrentGasPrice()
    return Number(ethers.formatUnits(gasPrice, 'gwei'))
  }

  async isGasPriceAcceptable(): Promise<boolean> {
    const currentGwei = await this.getGasPriceGwei()
    return currentGwei <= config.maxGasPriceGwei
  }

  async estimateExecutionCost(gasLimit: bigint): Promise<bigint> {
    const gasPrice = await this.getCurrentGasPrice()
    return gasPrice * gasLimit
  }

  async estimateExecutionCostUsd(gasLimit: bigint, ethPriceUsd: number): Promise<number> {
    const costWei = await this.estimateExecutionCost(gasLimit)
    const costEth = Number(ethers.formatEther(costWei))
    return costEth * ethPriceUsd
  }
}
