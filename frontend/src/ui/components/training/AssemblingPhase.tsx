import React, { useState } from 'react';
import { useTraining } from '../../contexts/TrainingContext';
import {
  Users,
  Network,
  CheckCircle2,
  Coins,
  Globe,
  Server,
  MapPin,
  Shield,
  Copy,
  Eye,
  Zap,
  Clock,
  Loader2,
  Play,
} from 'lucide-react';
import { toast } from 'sonner';

export const AssemblingPhase = () => {
  const {
    trainerCount,
    activeJobId,
    beginFinalTraining,
    isLoading,
    trainerNodes,
  } = useTraining();

  const copyToClipboard = async (text: string) => {
    try {
      await navigator.clipboard.writeText(text);
      toast.success('Copied to clipboard');
    } catch (err) {
      toast.error('Failed to copy');
    }
  };

  const extractLocationFromIP = (maddr: string): string => {
    const ipMatch = maddr.match(/\/ip4\/([^\/]+)/);
    if (!ipMatch) return 'Unknown';

    const ip = ipMatch[1];
    if (
      ip === '0.0.0.0' ||
      ip.startsWith('127.') ||
      ip.startsWith('192.168.') ||
      ip.startsWith('10.')
    ) {
      return 'Local Network';
    }

    // Mock location mapping for demo - in real app, use IP geolocation service
    const locationMap: { [key: string]: string } = {
      '13.201.70.151': 'Asia-Pacific (Mumbai)',
      '52.91.78.123': 'US-East (Virginia)',
      '18.130.24.67': 'EU-West (London)',
      '54.169.87.234': 'Asia-Pacific (Singapore)',
      '3.120.191.45': 'EU-Central (Frankfurt)',
    };

    return locationMap[ip] || `IP: ${ip}`;
  };

  const shortenPeerId = (peerId: string): string => {
    return `${peerId.slice(0, 8)}...${peerId.slice(-8)}`;
  };

  const extractPort = (maddr: string): string => {
    const portMatch = maddr.match(/\/tcp\/(\d+)/);
    return portMatch ? portMatch[1] : 'Unknown';
  };

  return (
    <div className='bg-surface p-8 rounded-xl border border-border'>
      <div className='flex items-center justify-between mb-6'>
        <div className='flex items-center gap-3'>
          <div className='w-10 h-10 bg-primary/20 rounded-lg flex items-center justify-center border border-primary/30'>
            <Users className='w-6 h-6 text-primary' />
          </div>
          <div>
            <h2 className='text-xl font-semibold text-text-primary'>
              Trainer Nodes Assembling
            </h2>
            <div className='flex items-center gap-2 mt-1'>
              <span className='text-text-secondary text-sm'>Round ID:</span>
              <code className='text-primary bg-primary/10 px-2 py-1 rounded text-xs font-mono'>
                {activeJobId || 'N/A'}
              </code>
              <button
                onClick={() => copyToClipboard(activeJobId || '')}
                className='text-primary hover:text-primary/80 transition-colors'
              >
                <Copy className='w-3 h-3' />
              </button>
            </div>
          </div>
        </div>
        <div className='text-right'>
          <div className='text-3xl font-bold text-primary'>{trainerCount}</div>
          <div className='text-sm text-text-secondary'>Nodes Active</div>
        </div>
      </div>

      <div className='flex items-center justify-between p-4 bg-primary/10 border border-primary/20 rounded-lg mb-6'>
        <div className='flex items-center gap-2'>
          <Network className='w-5 h-5 text-primary animate-pulse' />
          <span className='text-text-primary'>
            {trainerCount < 1
              ? 'Waiting for minimum trainers...'
              : 'Network ready for training!'}
          </span>
        </div>
        <div className='flex items-center gap-4 text-sm'>
          <span className='text-text-secondary'>Min: 1 node</span>
          <span className='text-primary'>Optimal: 5+ nodes</span>
        </div>
      </div>
      {/* Trainer Nodes Grid */}
      {trainerNodes && trainerNodes.length > 0 && (
        <div className='mb-6'>
          <div className='flex items-center gap-2 mb-4'>
            <Server className='w-5 h-5 text-primary' />
            <h3 className='text-lg font-medium text-text-primary'>
              Active Trainer Nodes
            </h3>
          </div>

          <div className='grid gap-4 md:grid-cols-2 lg:grid-cols-3'>
            {trainerNodes.map((node, index) => {
              const location = extractLocationFromIP(node.pub_maddr);
              const { status, color } = {
                status: 'ready',
                color: 'text-green-400',
              };
              const port = extractPort(node.pub_maddr);

              return (
                <div
                  key={node.peer_id}
                  className='bg-background border border-border rounded-lg p-4 hover:border-primary/30 transition-colors'
                >
                  {/* Node Header */}
                  <div className='flex items-center justify-between mb-3'>
                    <div className='flex items-center gap-2'>
                      <div className='w-8 h-8 bg-primary/20 rounded-full flex items-center justify-center text-xs font-bold text-primary'>
                        {index + 1}
                      </div>
                      <span className='font-medium text-text-primary'>
                        Node #{index + 1}
                      </span>
                    </div>
                    <span
                      className={`text-xs px-2 py-1 rounded-full bg-surface border ${color}`}
                    >
                      {status}
                    </span>
                  </div>

                  {/* Location */}
                  <div className='flex items-center gap-2 mb-2'>
                    <MapPin className='w-4 h-4 text-text-secondary' />
                    <span className='text-sm text-text-primary'>
                      {location}
                    </span>
                  </div>

                  {/* Connection Info */}
                  <div className='space-y-2 mb-3'>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-text-secondary'>Peer ID:</span>
                      <div className='flex items-center gap-1'>
                        <code className='text-text-primary font-mono'>
                          {shortenPeerId(node.peer_id)}
                        </code>
                        <button
                          onClick={() => copyToClipboard(node.peer_id)}
                          className='text-primary hover:text-primary/80 transition-colors'
                        >
                          <Copy className='w-3 h-3' />
                        </button>
                      </div>
                    </div>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-text-secondary'>Port:</span>
                      <code className='text-text-primary font-mono'>
                        {port}
                      </code>
                    </div>
                    <div className='flex items-center justify-between text-xs'>
                      <span className='text-text-secondary'>Role:</span>
                      <span className='text-primary font-medium'>
                        {node.role}
                      </span>
                    </div>
                  </div>

                  {/* Performance Indicators (Mock Data) */}
                  <div className='flex items-center justify-between pt-3 border-t border-border'>
                    <div className='flex items-center gap-1'>
                      <Zap className='w-3 h-3 text-green-400' />
                      <span className='text-xs text-text-secondary'>
                        {Math.floor(Math.random() * 50) + 50}ms ping
                      </span>
                    </div>
                    <div className='flex items-center gap-1'>
                      <Shield className='w-3 h-3 text-blue-400' />
                      <span className='text-xs text-text-secondary'>
                        {Math.floor(Math.random() * 30) + 70}% uptime
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>

          {/* Network Stats Summary */}
          <div className='mt-4 grid grid-cols-2 md:grid-cols-4 gap-4'>
            <div className='bg-primary/5 border border-primary/20 rounded-lg p-3 text-center'>
              <div className='text-lg font-bold text-primary'>
                {trainerNodes.length}
              </div>
              <div className='text-xs text-text-secondary'>Total Nodes</div>
            </div>
            <div className='bg-green-500/5 border border-green-500/20 rounded-lg p-3 text-center'>
              <div className='text-lg font-bold text-green-400'>
                {trainerCount}
              </div>
              <div className='text-xs text-text-secondary'>Ready</div>
            </div>
            <div className='bg-yellow-500/5 border border-yellow-500/20 rounded-lg p-3 text-center'>
              <div className='text-lg font-bold text-yellow-400'>{0}</div>
              <div className='text-xs text-text-secondary'>Joining</div>
            </div>
            <div className='bg-blue-500/5 border border-blue-500/20 rounded-lg p-3 text-center'>
              <div className='text-lg font-bold text-blue-400'>
                {Math.floor(Math.random() * 100) + 200}ms
              </div>
              <div className='text-xs text-text-secondary'>Avg Latency</div>
            </div>
          </div>
        </div>
      )}
      {/* Training Controls */}
      {trainerCount >= 1 ? (
        <div className='space-y-4'>
          <div className='flex items-center gap-2 p-3 bg-green-500/10 border border-green-500/20 rounded-lg'>
            <CheckCircle2 className='w-5 h-5 text-green-500' />
            <span className='text-green-400 font-medium'>
              Minimum trainers assembled! Network is ready.
            </span>
          </div>
          <button
            onClick={beginFinalTraining}
            disabled={isLoading}
            className='w-full flex items-center justify-center bg-primary text-background font-semibold py-4 px-4 rounded-lg hover:bg-primary/90 disabled:opacity-50'
          >
            {isLoading ? (
              <Loader2 className='mr-2 h-5 w-5 animate-spin' />
            ) : (
              <Play className='mr-2 h-5 w-5' />
            )}
            {isLoading ? 'Processing...' : 'Start Final Training'}
          </button>
        </div>
      ) : (
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Network className='w-8 h-8 text-primary animate-pulse' />
          </div>
          <h3 className='text-lg font-medium text-text-primary mb-2'>
            Waiting for Trainer Nodes
          </h3>
          <p className='text-text-secondary'>
            Need at least 1 trainer to begin. Current: {trainerCount}
          </p>
        </div>
      )}

      {/* {trainerCount < 1 && (
        <div className='text-center py-8'>
          <div className='w-16 h-16 bg-primary/10 rounded-full flex items-center justify-center mx-auto mb-4'>
            <Network className='w-8 h-8 text-primary animate-pulse' />
          </div>
          <h3 className='text-lg font-medium text-text-primary mb-2'>
            Waiting for Trainer Nodes
          </h3>
          <p className='text-text-secondary'>
            Need at least 1 trainer node to begin training. Current:{' '}
            {trainerCount}
          </p>
        </div>
      )} */}
    </div>
  );
};
