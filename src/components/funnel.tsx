'use client'

import React, { useState, useEffect } from 'react'
import { motion, AnimatePresence } from 'framer-motion'
import { AlertCircle, CheckCircle, Clock, User, Tag, Calendar, Layers, Hash, MessageSquare } from 'lucide-react'

const groupTickets = (tickets) => {
  const root = { name: 'All Tickets', type: 'root', children: [], value: tickets.length }

  const tiers = {}
  const domains = {}
  const severities = {}
  const statuses = {}

  tickets.forEach((ticket) => {
    // Tier level
    if (!tiers[ticket.tiers]) {
      tiers[ticket.tiers] = { name: ticket.tiers, type: 'tier', children: [], value: 0 }
      root.children.push(tiers[ticket.tiers])
    }
    tiers[ticket.tiers].value++

    // Domain level
    ticket.domains.forEach(domain => {
      const domainKey = `${ticket.tiers}-${domain.name}`
      if (!domains[domainKey]) {
        domains[domainKey] = { name: domain.name, type: 'domain', children: [], value: 0 }
        tiers[ticket.tiers].children.push(domains[domainKey])
      }
      domains[domainKey].value++

      // Severity level
      const severityKey = `${domainKey}-${ticket.severity}`
      if (!severities[severityKey]) {
        severities[severityKey] = { name: ticket.severity, type: 'severity', children: [], value: 0 }
        domains[domainKey].children.push(severities[severityKey])
      }
      severities[severityKey].value++

      // Status level
      const statusKey = `${severityKey}-${ticket.ticketStatus}`
      if (!statuses[statusKey]) {
        statuses[statusKey] = { name: ticket.ticketStatus, type: 'status', tickets: [], value: 0 }
        severities[severityKey].children.push(statuses[statusKey])
      }
      statuses[statusKey].tickets.push(ticket)
      statuses[statusKey].value++
    })
  })

  return root
}

const FunnelLevel = ({ node, depth, onSelect }) => {
  const maxWidth = 100 - depth * 20
  const width = `${Math.max(maxWidth, 20)}%`
  const hue = 200 + depth * 30

  return (
    <motion.div
      className="cursor-pointer rounded-lg p-4 text-center shadow-md transition-colors mx-auto"
      style={{ 
        width,
        maxWidth: '70rem',
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

const TicketCard = ({ ticket, onClick }) => {
  const statusColor = {
    'New': 'bg-yellow-100 text-yellow-800',
    'ONHOLD': 'bg-orange-100 text-orange-800',
    'INV': 'bg-purple-100 text-purple-800',
    'RESOLVED': 'bg-green-100 text-green-800',
  }[ticket.ticketStatus] || 'bg-gray-100 text-gray-800'

  return (
    <motion.div
      className="bg-white p-6 rounded-lg shadow-lg cursor-pointer"
      whileHover={{ scale: 1.03 }}
      onClick={onClick}
    >
      <h3 className="font-bold text-lg mb-2 text-gray-800">{ticket.title}</h3>
      <div className="flex items-center mb-2">
        <AlertCircle className="w-4 h-4 mr-2 text-red-500" />
        <span className={`px-2 py-1 rounded-full text-xs font-medium ${statusColor}`}>
          {ticket.ticketStatus}
        </span>
      </div>
      <div className="flex items-center mb-2">
        <User className="w-4 h-4 mr-2 text-blue-500" />
        <span className="text-sm text-gray-600">{ticket.domains.map(d => d.name).join(', ')}</span>
      </div>
      <div className="flex items-center mb-2">
        <Tag className="w-4 h-4 mr-2 text-purple-500" />
        <span className="text-sm text-gray-600">{ticket.severity}</span>
      </div>
      <div className="flex items-center">
        <Calendar className="w-4 h-4 mr-2 text-green-500" />
        <span className="text-sm text-gray-600">{new Date(ticket.reportedOn).toLocaleDateString()}</span>
      </div>
    </motion.div>
  )
}

export default function Component({ tickets = [], resolutions = [] }) {
  const [groupedTickets, setGroupedTickets] = useState(null)
  const [selectedPath, setSelectedPath] = useState([])
  const [selectedTicket, setSelectedTicket] = useState(null)

  useEffect(() => {
    if (tickets.length > 0) {
      setGroupedTickets(groupTickets(tickets))
    }
  }, [tickets])

  const handleSelect = (node, depth) => {
    setSelectedPath((prev) => {
      const newPath = prev.slice(0, depth)
      newPath.push(node)
      return newPath
    })
  }

  const findResolution = (ticketId) => {
    return resolutions.find(resolution => resolution.id === ticketId)
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
              {selectedPath[selectedPath.length - 1].tickets.map((ticket) => (
                <TicketCard
                  key={ticket.id}
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
                <h2 className="text-3xl font-bold mb-6 text-gray-800">{selectedTicket.title}</h2>
                <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <AlertCircle className="w-6 h-6 mr-3 text-blue-500" />
                      <span className="font-semibold">Status:</span>
                      <span className="ml-2">{selectedTicket.ticketStatus}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-6 h-6 mr-3 text-green-500" />
                      <span className="font-semibold">Domains:</span>
                      <span className="ml-2">{selectedTicket.domains.map(d => d.name).join(', ')}</span>
                    </div>
                    <div className="flex items-center">
                      <Tag className="w-6 h-6 mr-3 text-purple-500" />
                      <span className="font-semibold">Severity:</span>
                      <span className="ml-2">{selectedTicket.severity}</span>
                    </div>
                    <div className="flex items-center">
                      <Clock className="w-6 h-6 mr-3 text-red-500" />
                      <span className="font-semibold">Reported:</span>
                      <span className="ml-2">{new Date(selectedTicket.reportedOn).toLocaleString()}</span>
                    </div>
                  </div>
                  <div className="space-y-4">
                    <div className="flex items-center">
                      <Hash className="w-6 h-6 mr-3 text-yellow-500" />
                      <span className="font-semibold">Type:</span>
                      <span className="ml-2">{selectedTicket.type}</span>
                    </div>
                    <div className="flex items-center">
                      <Layers className="w-6 h-6 mr-3 text-indigo-500" />
                      <span className="font-semibold">Tier:</span>
                      <span className="ml-2">{selectedTicket.tiers}</span>
                    </div>
                    <div className="flex items-center">
                      <AlertCircle className="w-6 h-6 mr-3 text-orange-500" />
                      <span className="font-semibold">Priority:</span>
                      <span className="ml-2">{selectedTicket.priority}</span>
                    </div>
                    <div className="flex items-center">
                      <User className="w-6 h-6 mr-3 text-teal-500" />
                      <span className="font-semibold">Owner:</span>
                      <span className="ml-2">{selectedTicket.owner.name}</span>
                    </div>
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Tags</h3>
                  <div className="flex flex-wrap gap-2">
                    {selectedTicket.tags.map((tag) => (
                      <span key={tag.id} className="bg-blue-100 text-blue-800 px-2 py-1 rounded-full text-sm">
                        {tag.label}
                      </span>
                    ))}
                  </div>
                </div>
                <div className="mt-6">
                  <h3 className="text-xl font-semibold mb-2">Engagements</h3>
                  <div className="space-y-2">
                    {selectedTicket.engagements.map((engagement) => (
                      <div key={engagement.id} className="flex items-center">
                        <MessageSquare className="w-5 h-5 mr-2 text-gray-500" />
                        <span>{engagement.action} by {engagement.member.name} on {new Date(engagement.engagedOn).toLocaleString()}</span>
                      </div>
                    ))}
                  </div>
                </div>
                {findResolution(selectedTicket.id) && (
                  <div className="mt-6">
                    <h3 className="text-xl font-semibold mb-2">Resolution</h3>
                    <div className="space-y-2">
                      <div>
                        <span className="font-semibold">Root Cause: </span>
                        <span>{findResolution(selectedTicket.id)?.rootCause}</span>
                      </div>
                      <div>
                        <span className="font-semibold">Solution: </span>
                        <span>{findResolution(selectedTicket.id)?.solution}</span>
                      </div>
                    </div>
                  </div>
                )}
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