"use client"

import { Button } from "@/components/ui/button"
import { useWeb3 } from "@/components/web3-provider"
import { Loader2, Wallet, AlertTriangle } from "lucide-react"
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu"
import { Badge } from "@/components/ui/badge"

export function WalletConnect() {
  const { account, connect, disconnect, isConnecting, chainId, switchNetwork, isCorrectNetwork } = useWeb3()

  const shortenAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`
  }

  if (isConnecting) {
    return (
      <Button disabled variant="outline" className="border-primary/50">
        <Loader2 className="mr-2 h-4 w-4 animate-spin" />
        Connecting...
      </Button>
    )
  }

  if (account) {
    return (
      <div className="flex items-center gap-2">
        {!isCorrectNetwork && (
          <Button
            variant="destructive"
            size="sm"
            onClick={() => switchNetwork(11155111)}
            className="flex items-center gap-1"
          >
            <AlertTriangle className="h-4 w-4" />
            Switch to Sepolia
          </Button>
        )}
        <DropdownMenu>
          <DropdownMenuTrigger asChild>
            <Button variant="outline" className="border-primary/50 neon-border">
              <Wallet className="mr-2 h-4 w-4" />
              {shortenAddress(account)}
              {isCorrectNetwork && (
                <Badge variant="outline" className="ml-2 border-green-500/50 text-green-500">
                  Sepolia
                </Badge>
              )}
            </Button>
          </DropdownMenuTrigger>
          <DropdownMenuContent align="end">
            <DropdownMenuLabel>My Account</DropdownMenuLabel>
            <DropdownMenuSeparator />
            <DropdownMenuItem asChild>
              <a href={`https://sepolia.etherscan.io/address/${account}`} target="_blank" rel="noopener noreferrer">
                View on Etherscan
              </a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/profile">My Profile</a>
            </DropdownMenuItem>
            <DropdownMenuItem asChild>
              <a href="/profile?tab=nfts">My NFTs</a>
            </DropdownMenuItem>
            <DropdownMenuSeparator />
            <DropdownMenuItem onClick={disconnect} className="text-destructive">
              Disconnect
            </DropdownMenuItem>
          </DropdownMenuContent>
        </DropdownMenu>
      </div>
    )
  }

  return (
    <Button onClick={connect} className="bg-primary hover:bg-primary/80 neon-glow">
      <Wallet className="mr-2 h-4 w-4" />
      Connect Wallet
    </Button>
  )
}

