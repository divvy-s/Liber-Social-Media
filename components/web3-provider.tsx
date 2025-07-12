"use client"

import type React from "react"

import { createContext, useContext, useState, useEffect } from "react"
import { ethers } from "ethers"
import { useToast } from "@/components/ui/use-toast"

// Sepolia network configuration
const SEPOLIA_CHAIN_ID = 11155111
const SEPOLIA_CONFIG = {
  chainId: `0x${SEPOLIA_CHAIN_ID.toString(16)}`,
  chainName: "Sepolia",
  nativeCurrency: {
    name: "Sepolia Ether",
    symbol: "ETH",
    decimals: 18,
  },
  rpcUrls: ["https://sepolia.infura.io/v3/"],
  blockExplorerUrls: ["https://sepolia.etherscan.io"],
}

// NFT contract configuration
const NFT_CONTRACT_ADDRESS = "0xd9145CCE52D386f254917e481eB44e9943F39138"
const NFT_CONTRACT_ABI = [
  "function mint(string memory tokenURI) public returns (uint256)",
  "function tokenURI(uint256 tokenId) public view returns (string memory)",
  "function ownerOf(uint256 tokenId) public view returns (address)",
]

type Web3ContextType = {
  account: string | null
  provider: any
  signer: any
  connect: () => Promise<void>
  disconnect: () => void
  isConnecting: boolean
  chainId: number | null
  switchNetwork: (chainId: number) => Promise<void>
  mintNFT: (tokenURI: string) => Promise<string>
  isCorrectNetwork: boolean
  nftContract: any
}

const Web3Context = createContext<Web3ContextType>({
  account: null,
  provider: null,
  signer: null,
  connect: async () => {},
  disconnect: () => {},
  isConnecting: false,
  chainId: null,
  switchNetwork: async () => {},
  mintNFT: async () => "",
  isCorrectNetwork: false,
  nftContract: null,
})

export const useWeb3 = () => useContext(Web3Context)

export function Web3Provider({ children }: { children: React.ReactNode }) {
  const [account, setAccount] = useState<string | null>(null)
  const [provider, setProvider] = useState<any>(null)
  const [signer, setSigner] = useState<any>(null)
  const [isConnecting, setIsConnecting] = useState(false)
  const [chainId, setChainId] = useState<number | null>(null)
  const [nftContract, setNftContract] = useState<any>(null)
  const { toast } = useToast()

  // Check if user is on the correct network (Sepolia)
  const isCorrectNetwork = chainId === SEPOLIA_CHAIN_ID

  useEffect(() => {
    // Check if MetaMask is installed
    if (typeof window !== "undefined" && window.ethereum) {
      const provider = new ethers.BrowserProvider(window.ethereum)
      setProvider(provider)

      // Check if already connected
      const checkConnection = async () => {
        try {
          const accounts = await window.ethereum.request({ method: "eth_accounts" })
          if (accounts.length > 0) {
            setAccount(accounts[0])
            const network = await provider.getNetwork()
            setChainId(Number(network.chainId))

            // Get signer
            const signer = await provider.getSigner()
            setSigner(signer)

            // Initialize contract
            const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
            setNftContract(contract)
          }
        } catch (error) {
          console.error("Failed to get accounts", error)
        }
      }

      checkConnection()

      // Listen for account changes
      window.ethereum.on("accountsChanged", (accounts: string[]) => {
        if (accounts.length === 0) {
          setAccount(null)
          setSigner(null)
          setNftContract(null)
        } else {
          setAccount(accounts[0])
          // Update signer and contract when account changes
          const updateSignerAndContract = async () => {
            try {
              const signer = await provider.getSigner()
              setSigner(signer)
              const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
              setNftContract(contract)
            } catch (error) {
              console.error("Failed to update signer", error)
            }
          }
          updateSignerAndContract()
        }
      })

      // Listen for chain changes
      window.ethereum.on("chainChanged", (chainId: string) => {
        setChainId(Number(chainId))
        // Update signer and contract when chain changes
        const updateSignerAndContract = async () => {
          try {
            const signer = await provider.getSigner()
            setSigner(signer)
            const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
            setNftContract(contract)
          } catch (error) {
            console.error("Failed to update signer", error)
          }
        }
        updateSignerAndContract()
      })

      return () => {
        window.ethereum.removeAllListeners("accountsChanged")
        window.ethereum.removeAllListeners("chainChanged")
      }
    }
  }, [])

  const connect = async () => {
    if (!window.ethereum) {
      toast({
        title: "MetaMask not found",
        description: "Please install MetaMask to use this application",
        variant: "destructive",
      })
      return
    }

    setIsConnecting(true)
    try {
      const accounts = await window.ethereum.request({ method: "eth_requestAccounts" })
      setAccount(accounts[0])

      const network = await provider.getNetwork()
      setChainId(Number(network.chainId))

      // Get signer
      const signer = await provider.getSigner()
      setSigner(signer)

      // Initialize contract
      const contract = new ethers.Contract(NFT_CONTRACT_ADDRESS, NFT_CONTRACT_ABI, signer)
      setNftContract(contract)

      toast({
        title: "Connected",
        description: "Your wallet has been connected successfully",
      })

      // Check if on Sepolia, if not prompt to switch
      if (Number(network.chainId) !== SEPOLIA_CHAIN_ID) {
        toast({
          title: "Wrong Network",
          description: "Please switch to Sepolia testnet to use this application",
          variant: "destructive",
        })
        await switchNetwork(SEPOLIA_CHAIN_ID)
      }
    } catch (error: any) {
      toast({
        title: "Connection failed",
        description: error.message || "Failed to connect wallet",
        variant: "destructive",
      })
    } finally {
      setIsConnecting(false)
    }
  }

  const disconnect = () => {
    setAccount(null)
    setSigner(null)
    setNftContract(null)
    toast({
      title: "Disconnected",
      description: "Your wallet has been disconnected",
    })
  }

  const switchNetwork = async (targetChainId: number) => {
    if (!window.ethereum) return

    try {
      await window.ethereum.request({
        method: "wallet_switchEthereumChain",
        params: [{ chainId: `0x${targetChainId.toString(16)}` }],
      })
    } catch (error: any) {
      // This error code indicates that the chain has not been added to MetaMask
      if (error.code === 4902) {
        try {
          // Add Sepolia network
          await window.ethereum.request({
            method: "wallet_addEthereumChain",
            params: [SEPOLIA_CONFIG],
          })
        } catch (addError) {
          toast({
            title: "Network add failed",
            description: "Failed to add Sepolia network to MetaMask",
            variant: "destructive",
          })
        }
      } else {
        toast({
          title: "Network switch failed",
          description: error.message || "Failed to switch network",
          variant: "destructive",
        })
      }
    }
  }

  // Function to mint an NFT
  const mintNFT = async (tokenURI: string): Promise<string> => {
    if (!account || !signer || !nftContract) {
      throw new Error("Wallet not connected or contract not initialized")
    }

    if (!isCorrectNetwork) {
      await switchNetwork(SEPOLIA_CHAIN_ID)
      throw new Error("Please switch to Sepolia network to mint NFTs")
    }

    try {
      // Call the mint function on the contract
      const tx = await nftContract.mint(tokenURI)

      // Wait for the transaction to be mined
      const receipt = await tx.wait()

      // Get the token ID from the transaction receipt (this depends on the contract implementation)
      // For this example, we'll just return the transaction hash
      return tx.hash
    } catch (error: any) {
      console.error("Error minting NFT:", error)
      throw new Error(error.message || "Failed to mint NFT")
    }
  }

  return (
    <Web3Context.Provider
      value={{
        account,
        provider,
        signer,
        connect,
        disconnect,
        isConnecting,
        chainId,
        switchNetwork,
        mintNFT,
        isCorrectNetwork,
        nftContract,
      }}
    >
      {children}
    </Web3Context.Provider>
  )
}

