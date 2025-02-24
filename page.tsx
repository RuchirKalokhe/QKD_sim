"use client"

import { useState, useEffect, useCallback } from "react"
import { Button } from "@/components/ui/button"
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card"
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs"
import { Progress } from "@/components/ui/progress"
import { Badge } from "@/components/ui/badge"
import { Switch } from "@/components/ui/switch"
import { Table, TableBody, TableCell, TableHead, TableHeader, TableRow } from "@/components/ui/table"
import { ArrowRight, RefreshCcw, Play, Pause, Check, X } from "lucide-react"
import { QuantumState } from "./quantum-state"
import { BasisExplanation } from "./basis-explanation"

type Basis = "computational" | "hadamard"
type QuantumBit = "0" | "1" | "+" | "-"

interface TransmissionStep {
  aliceBasis: Basis
  bobBasis: Basis
  eveBasis?: Basis
  aliceState: QuantumBit
  bobState?: QuantumBit
  eveState?: QuantumBit
  matched: boolean
  intercepted: boolean
}

export default function QKDSimulation() {
  const [isRunning, setIsRunning] = useState(false)
  const [hasEve, setHasEve] = useState(false)
  const [progress, setProgress] = useState(0)
  const [currentBit, setCurrentBit] = useState(0)
  const [transmissionSteps, setTransmissionSteps] = useState<TransmissionStep[]>([])
  const [finalKey, setFinalKey] = useState("")

  const generateRandomBasis = useCallback((): Basis => (Math.random() < 0.5 ? "computational" : "hadamard"), [])

  const generateRandomState = useCallback((basis: Basis): QuantumBit => {
    if (basis === "computational") {
      return Math.random() < 0.5 ? "0" : "1"
    }
    return Math.random() < 0.5 ? "+" : "-"
  }, [])

  const measureState = useCallback((state: QuantumBit, measureBasis: Basis, originalBasis: Basis): QuantumBit => {
    if (measureBasis === originalBasis) return state
    return ["0", "1", "+", "-"][Math.floor(Math.random() * 4)] as QuantumBit
  }, [])

  const startSimulation = () => {
    setIsRunning(true)
    setProgress(0)
    setCurrentBit(0)
    setTransmissionSteps([])
    setFinalKey("")
  }

  const stopSimulation = () => {
    setIsRunning(false)
  }

  // This effect handles the toggle of Eve during a simulation
  useEffect(() => {
    // Update existing transmission steps when Eve is toggled
    if (transmissionSteps.length > 0) {
      setTransmissionSteps(prevSteps => {
        return prevSteps.map(step => {
          if (hasEve && !step.intercepted) {
            // Add Eve data if Eve is turned on
            const eveBasis = generateRandomBasis()
            const eveState = measureState(step.aliceState, eveBasis, step.aliceBasis)
            const bobState = measureState(eveState, step.bobBasis, eveBasis)
            
            return {
              ...step,
              eveBasis,
              eveState,
              bobState,
              intercepted: true
            }
          } else if (!hasEve && step.intercepted) {
            // Remove Eve data if Eve is turned off
            const bobState = measureState(step.aliceState, step.bobBasis, step.aliceBasis)
            
            return {
              ...step,
              eveBasis: undefined,
              eveState: undefined,
              bobState,
              intercepted: false
            }
          }
          return step
        })
      })
    }
  }, [hasEve, generateRandomBasis, measureState])

  useEffect(() => {
    if (!isRunning || currentBit >= 8) return

    const interval = setInterval(() => {
      const aliceBasis = generateRandomBasis()
      const bobBasis = generateRandomBasis()
      const aliceState = generateRandomState(aliceBasis)
      let step: TransmissionStep

      if (hasEve) {
        const eveBasis = generateRandomBasis()
        const eveState = measureState(aliceState, eveBasis, aliceBasis)
        const bobState = measureState(eveState, bobBasis, eveBasis)

        step = {
          aliceBasis,
          bobBasis,
          eveBasis,
          aliceState,
          bobState,
          eveState,
          matched: aliceBasis === bobBasis,
          intercepted: true,
        }
      } else {
        const bobState = measureState(aliceState, bobBasis, aliceBasis)

        step = {
          aliceBasis,
          bobBasis,
          aliceState,
          bobState,
          matched: aliceBasis === bobBasis,
          intercepted: false,
        }
      }

      setTransmissionSteps((prev) => [...prev, step])

      if (step.matched) {
        setFinalKey((prev) => prev + (step.aliceState === "0" || step.aliceState === "+" ? "0" : "1"))
      }

      setCurrentBit((prev) => prev + 1)
      setProgress((currentBit + 1) * 12.5)

      if (currentBit === 7) {
        setIsRunning(false)
      }
    }, 1000)

    return () => clearInterval(interval)
  }, [isRunning, currentBit, hasEve, generateRandomState, generateRandomBasis, measureState])

  return (
    <div className="min-h-screen bg-background text-foreground">
      <div className="container mx-auto p-4 space-y-6">
        <div className="flex justify-between items-center">
          <h1 className="text-2xl font-bold">BB84 Quantum Key Distribution</h1>
          <div className="flex items-center gap-4">
            <div className="flex items-center space-x-2">
              <Switch 
                checked={hasEve} 
                onCheckedChange={setHasEve} 
                aria-label="Toggle Eve"
                disabled={isRunning} // Prevent toggling during simulation
              />
              <span>Eve</span>
            </div>
          </div>
        </div>

        <Card>
          <CardHeader>
            <div className="flex justify-between items-center">
              <div>
                <CardTitle>Quantum State Transmission</CardTitle>
                <CardDescription>Demonstrating the BB84 protocol with polarized photons</CardDescription>
              </div>
              <div className="space-x-2">
                <Button
                  variant="outline"
                  size="icon"
                  onClick={() => {
                    setProgress(0)
                    setCurrentBit(0)
                    setTransmissionSteps([])
                    setFinalKey("")
                  }}
                >
                  <RefreshCcw className="h-4 w-4" />
                </Button>
                <Button
                  variant={isRunning ? "destructive" : "default"}
                  onClick={() => (isRunning ? stopSimulation() : startSimulation())}
                  disabled={currentBit >= 8}
                >
                  {isRunning ? <Pause className="mr-2 h-4 w-4" /> : <Play className="mr-2 h-4 w-4" />}
                  {isRunning ? "Stop" : "Start"} Simulation
                </Button>
              </div>
            </div>
            <Progress value={progress} className="w-full" />
          </CardHeader>
          <CardContent>
            <Tabs defaultValue="visualization" className="w-full">
              <TabsList className="grid w-full grid-cols-2">
                <TabsTrigger value="visualization">Visualization</TabsTrigger>
                <TabsTrigger value="statistics">Statistics</TabsTrigger>
              </TabsList>
              <TabsContent value="visualization" className="space-y-6">
                <BasisExplanation />

                <div className="relative h-[200px] rounded-lg border bg-muted/40 p-4">
                  <div className="absolute left-4 top-1/2 -translate-y-1/2 space-y-4">
                    <Card className="w-[140px]">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">Alice</CardTitle>
                        {transmissionSteps.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Basis: {transmissionSteps[currentBit - 1]?.aliceBasis === "computational" ? "+" : "×"}
                            </p>
                            <div className="mt-2">
                              <QuantumState
                                state={transmissionSteps[currentBit - 1]?.aliceState}
                                basis={transmissionSteps[currentBit - 1]?.aliceBasis}
                              />
                            </div>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  </div>
                  {hasEve && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2 space-y-4">
                      <Card className="w-[140px]">
                        <CardHeader className="p-3">
                          <CardTitle className="text-sm text-destructive">Eve</CardTitle>
                          {transmissionSteps.length > 0 && transmissionSteps[currentBit - 1]?.eveBasis && (
                            <div className="mt-2">
                              <p className="text-xs text-muted-foreground">
                                Basis: {transmissionSteps[currentBit - 1]?.eveBasis === "computational" ? "+" : "×"}
                              </p>
                              <div className="mt-2">
                                <QuantumState
                                  state={transmissionSteps[currentBit - 1]?.eveState}
                                  basis={transmissionSteps[currentBit - 1]?.eveBasis}
                                />
                              </div>
                            </div>
                          )}
                        </CardHeader>
                      </Card>
                    </div>
                  )}
                  <div className="absolute right-4 top-1/2 -translate-y-1/2 space-y-4">
                    <Card className="w-[140px]">
                      <CardHeader className="p-3">
                        <CardTitle className="text-sm">Bob</CardTitle>
                        {transmissionSteps.length > 0 && (
                          <div className="mt-2">
                            <p className="text-xs text-muted-foreground">
                              Basis: {transmissionSteps[currentBit - 1]?.bobBasis === "computational" ? "+" : "×"}
                            </p>
                            <div className="mt-2">
                              <QuantumState
                                state={transmissionSteps[currentBit - 1]?.bobState}
                                basis={transmissionSteps[currentBit - 1]?.bobBasis}
                              />
                            </div>
                          </div>
                        )}
                      </CardHeader>
                    </Card>
                  </div>
                  {isRunning && (
                    <div className="absolute left-1/2 top-1/2 -translate-x-1/2 -translate-y-1/2">
                      <ArrowRight className="h-6 w-6 animate-pulse text-primary" />
                    </div>
                  )}
                </div>

                <Card>
                  <Table>
                    <TableHeader>
                      <TableRow>
                        <TableHead className="w-[50px]">Bit #</TableHead>
                        <TableHead>Alice's Photon</TableHead>
                        <TableHead>Alice's Basis</TableHead>
                        {hasEve && (
                          <>
                            <TableHead>Eve's Basis</TableHead>
                            <TableHead>Eve's Measurement</TableHead>
                          </>
                        )}
                        <TableHead>Bob's Basis</TableHead>
                        <TableHead>Bob's Measurement</TableHead>
                        <TableHead>Bases Match</TableHead>
                        <TableHead>Key Bit</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {transmissionSteps.map((step, index) => (
                        <TableRow key={index} className={step.matched ? "bg-green-500/10" : undefined}>
                          <TableCell>{index + 1}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <QuantumState state={step.aliceState} basis={step.aliceBasis} size={24} />
                            </div>
                          </TableCell>
                          <TableCell>{step.aliceBasis === "computational" ? "+" : "×"}</TableCell>
                          {hasEve && (
                            <>
                              <TableCell>{step.eveBasis === "computational" ? "+" : "×"}</TableCell>
                              <TableCell>
                                <div className="flex items-center gap-2">
                                  <QuantumState state={step.eveState} basis={step.eveBasis} size={24} />
                                </div>
                              </TableCell>
                            </>
                          )}
                          <TableCell>{step.bobBasis === "computational" ? "+" : "×"}</TableCell>
                          <TableCell>
                            <div className="flex items-center gap-2">
                              <QuantumState state={step.bobState} basis={step.bobBasis} size={24} />
                            </div>
                          </TableCell>
                          <TableCell>
                            {step.matched ? (
                              <Check className="h-4 w-4 text-green-500" />
                            ) : (
                              <X className="h-4 w-4 text-red-500" />
                            )}
                          </TableCell>
                          <TableCell className="font-mono">
                            {step.matched ? (step.aliceState === "0" || step.aliceState === "+" ? "0" : "1") : "-"}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </Card>
              </TabsContent>
              <TabsContent value="statistics" className="space-y-4">
                <div className="grid grid-cols-2 gap-4">
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Bits Transmitted</CardTitle>
                      <CardDescription>{currentBit}/8</CardDescription>
                    </CardHeader>
                  </Card>
                  <Card>
                    <CardHeader className="p-4">
                      <CardTitle className="text-sm">Matched Basis Bits</CardTitle>
                      <CardDescription>{transmissionSteps.filter((step) => step.matched).length}</CardDescription>
                    </CardHeader>
                  </Card>
                </div>
                <Card>
                  <CardHeader className="p-4">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-sm">Final Key</CardTitle>
                      {finalKey && (
                        <Badge variant="outline" className="font-mono">
                          {finalKey.length} bits
                        </Badge>
                      )}
                    </div>
                    <CardDescription className="font-mono break-all">
                      {finalKey || "No key generated yet"}
                    </CardDescription>
                  </CardHeader>
                </Card>
              </TabsContent>
            </Tabs>
          </CardContent>
        </Card>
      </div>
    </div>
  )
}

