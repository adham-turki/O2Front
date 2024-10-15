'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock, User, Tag, Calendar } from 'lucide-react'

interface Ticket {
  ticketId: number
  platform: string
  issue: string
  category: string
  customer: string
  engagedTier: number
  severity: string
  currentStatus: string
  impact: string
  type: string
  dateOpened: string
  dateClosed: string | null
  affectedServices: string[]
  engagedEngineers: string[]
}

interface TreeNode {
  name: string
  type: 'root' | 'tier' | 'platform' | 'customer' | 'severity'
  children?: TreeNode[]
  tickets?: Ticket[]
  value: number
}

const groupTickets = (tickets: Ticket[]): TreeNode => {
  const root: TreeNode = { name: 'All Tickets', type: 'root', children: [], value: tickets.length }

  const tiers: { [key: number]: TreeNode } = {}
  const platforms: { [key: string]: TreeNode } = {}
  const customers: { [key: string]: TreeNode } = {}
  const severities: { [key: string]: TreeNode } = {}

  tickets.forEach((ticket) => {
    
    // Tier level
    if (!tiers[ticket.engagedTier]) {
      tiers[ticket.engagedTier] = { name: `Tier ${ticket.engagedTier}`, type: 'tier', children: [], value: 0 }
      root.children!.push(tiers[ticket.engagedTier])
    }
    tiers[ticket.engagedTier].value++

    // Platform level
    const tierKey = `${ticket.engagedTier}-${ticket.platform}`
    if (!platforms[tierKey]) {
      platforms[tierKey] = { name: ticket.platform, type: 'platform', children: [], value: 0 }
      tiers[ticket.engagedTier].children!.push(platforms[tierKey])
    }
    platforms[tierKey].value++

    // Customer level
    const platformKey = `${tierKey}-${ticket.customer}`
    if (!customers[platformKey]) {
      customers[platformKey] = { name: ticket.customer, type: 'customer', children: [], value: 0 }
      platforms[tierKey].children!.push(customers[platformKey])
    }
    customers[platformKey].value++

    // Severity level
    const customerKey = `${platformKey}-${ticket.severity}`
    if (!severities[customerKey]) {
      severities[customerKey] = { name: ticket.severity, type: 'severity', tickets: [], value: 0 }
      customers[platformKey].children!.push(severities[customerKey])
    }
    severities[customerKey].tickets!.push(ticket)
    severities[customerKey].value++
  })
   

  return root
}

const FunnelLevel = ({ node, depth, onSelect }: { node: TreeNode; depth: number; onSelect: () => void }) => {
  const maxWidth = 100 - depth * 20 // Decrease max width by 20% for each level
  const width = `${Math.max(maxWidth, 20)}%` // Ensure a minimum width of 40%
  const hue = 200 + depth * 30

  return (
    <motion.div
      className="cursor-pointer rounded-lg p-4 text-center shadow-md transition-colors mx-auto "
      style={{ 
        width,
        maxWidth: '70rem', // Increased max-width for the root level
        backgroundColor: `hsl(${hue}, 70%, 90%)`,
      }}
      whileHover={{ scale: 1.05 }}
      onClick={onSelect}
    >
      <h3 className="font-bold text-lg">{node.name}</h3>
      <p className="text-gray-700">{node.value} ticket{node.value !== 1 ? 's' : ''}</p>
      <p className="text-sm text-gray-600 mt-2 capitalize">{node.type}</p>
    </motion.div>
  )
}

const TicketCard = ({ ticket, onClick }: { ticket: Ticket; onClick: () => void }) => {
  const statusColor = {
    'Open': 'bg-yellow-100 text-yellow-800',
    'In Progress': 'bg-blue-100 text-blue-800',
    'Closed': 'bg-green-100 text-green-800',
  }[ticket.currentStatus] || 'bg-gray-100 text-gray-800'

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg cursor-pointer"
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
    >
      <h3 className="font-bold text-lg mb-2 text-gray-800">{ticket.issue}</h3>
      <div className="flex items-center mb-2">
        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {ticket.currentStatus}
        </span>
      </div>
      <div className="flex items-center mb-2">
        <User className="w-4 h-4 mr-2 text-blue-500" />
        <span className="text-sm text-gray-600">{ticket.customer}</span>
      </div>
      <div className="flex items-center mb-2">
        <Tag className="w-4 h-4 mr-2 text-purple-500" />
        <span className="text-sm text-gray-600">{ticket.severity}</span>
      </div>
      <div className="flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-green-500" />
        <span className="text-sm text-gray-600">{new Date(ticket.dateOpened).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )
}

export default function Component() {
  const [tickets, setTickets] = useState<Ticket[]>([])
  const [groupedTickets, setGroupedTickets] = useState<TreeNode | null>(null)
  const [selectedPath, setSelectedPath] = useState<TreeNode[]>([])
  const [selectedTicket, setSelectedTicket] = useState<Ticket | null>(null)

  useEffect(() => {
    const fetchData = async () => {
      try {
        const response = await fetch('/data.json')
        const data = await response.json()
        setTickets(data)
        console.log("Tickets data:", data)
      } catch (error) {
        console.error("Error fetching ticket data:", error)
      }
    }

    fetchData()
  }, [])

  useEffect(() => {
    if (tickets.length > 0) {
      setGroupedTickets(groupTickets(tickets))
    }
  }, [tickets])

  const handleSelect = (node: TreeNode, depth: number) => {
    setSelectedPath((prev) => {
      const newPath = prev.slice(0, depth)
      newPath.push(node)
      return newPath
    })
  }

  return (
    <div className="w-full min-h-screen bg-gradient-to-br from-blue-100 via-purple-100 to-pink-100 p-8">
      <h1 className="text-4xl font-bold text-center mb-8 text-gray-800">Tickets Funnel Tree</h1>
      <div className="max-w-7xl mx-auto space-y-8">
        {groupedTickets && (
          <div className="w-full">
            <FunnelLevel node={groupedTickets} depth={0} onSelect={() => handleSelect(groupedTickets, 0)} />
          </div>
        )}
        <AnimatePresence>
          {selectedPath.map((node, index) => (
            node.children && (
              <motion.div
                key={`level-${index}`}
                initial={{ opacity: 0, y: 20 }}
                animate={{ opacity: 1, y: 0 }}
                exit={{ opacity: 0, y: -20 }}
                className="flex flex-col items-center gap-4 w-full"
              >
                {node.children.map((childNode) => (
                  <FunnelLevel
                    key={childNode.name}
                    node={childNode}
                    depth={index + 1}
                    onSelect={() => handleSelect(childNode, index + 1)}
                  />
                ))}
              </motion.div>
            )
          ))}
        </AnimatePresence>

        {/* Display tickets at the lowest level */}
        <AnimatePresence>
          {selectedPath.length > 0 && selectedPath[selectedPath.length - 1].tickets && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6"
            >
              {selectedPath[selectedPath.length - 1].tickets!.map((ticket) => (
                <TicketCard
                  key={ticket.ticketId}
                  ticket={ticket}
                  onClick={() => setSelectedTicket(ticket)}
                />
              ))}
            </motion.div>
          )}
        </AnimatePresence>

        {/* Ticket details modal */}
        <AnimatePresence>
          {selectedTicket && (
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
              className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center p-4 z-50"
              onClick={() => setSelectedTicket(null)}
            >
              <motion.div
                initial={{ scale: 0.9, opacity: 0 }}
                animate={{ scale: 1, opacity: 1 }}
                exit={{ scale: 0.9, opacity: 0 }}
                className="bg-white rounded-lg p-8 max-w-4xl w-full max-h-[90vh] overflow-auto"
                onClick={(e) => e.stopPropagation()}
              >
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{selectedTicket.issue}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-6 h-6 mr-3 text-blue-500" />
                      <span className="font-semibold">Status:</span>
                      <span className="ml-2">{selectedTicket.currentStatus}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-6 h-6 mr-3 text-green-500" />
                      <span className="font-semibold">Customer:</span>
                      <span className="ml-2">{selectedTicket.customer}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-6 h-6 mr-3 text-purple-500" />
                      <span className="font-semibold">Severity:</span>
                      <span className="ml-2">{selectedTicket.severity}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-red-500" />
                      <span className="font-semibold">Opened:</span>
                      <span className="ml-2">{new Date(selectedTicket.dateOpened).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div>
                      <span className="font-semibold">Platform:</span>
                      <span className="ml-2">{selectedTicket.platform}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Category:</span>
                      <span className="ml-2">{selectedTicket.category}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Impact:</span>
                      <span className="ml-2">{selectedTicket.impact}</span>
                    </div>
                    <div>
                      <span className="font-semibold">Type:</span>
                      <span className="ml-2">{selectedTicket.type}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Affected Services</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.affectedServices.map((service, index) => (
                      <span key={index} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {service}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Engaged Engineers</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.engagedEngineers.map((engineer, index) => (
                      <span key={index} className="bg-green-100 text-green-800 px-2 py-1 rounded-full text-sm">
                        {engineer}
                      </span>
                    ))}
                  </div>
                </div>
                <button
                  className="mt-8 bg-blue-500 text-white px-6 py-2 rounded-lg hover:bg-blue-600 transition-colors"
                  onClick={() => setSelectedTicket(null)}
                >
                  Close
                </button>
              </motion.div>
            </motion.div>
          )}
        </AnimatePresence>
      </div>
    </div>
  )
}