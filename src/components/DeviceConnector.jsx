import React, { useState } from 'react';
import { Smartphone, Monitor, Gauge, QrCode, CheckCircle2, X } from 'lucide-react';

export function DeviceConnector() {
  const [isOpen, setIsOpen] = useState(false);
  const [devices, setDevices] = useState([
    { id: 1, name: 'Truck Dashboard Unit (Android Auto)', type: 'dash', status: 'Active', latency: '12ms' },
    { id: 2, name: 'Redmi Note 12 Pro (Co-Driver)', type: 'mobile', status: 'Synced', latency: '24ms' },
    { id: 3, name: 'Garage Workstation', type: 'desktop', status: 'Standby', latency: '45ms' }
  ]);

  return (
    <>
      <button 
        className="connect-devices-btn"
        onClick={() => setIsOpen(true)}
        title="Connect & Sync Devices"
      >
        <Smartphone size={16} />
        <span>Connected Devices (3)</span>
      </button>

      {isOpen && (
        <div className="modal-backdrop" onClick={() => setIsOpen(false)}>
          <div className="modal-card" onClick={(e) => e.stopPropagation()}>
            <div className="modal-header">
              <div className="flex items-center gap-2">
                <Gauge className="text-amber-400" size={20} />
                <h3 className="text-lg font-bold">Multi-Device Link & Sync</h3>
              </div>
              <button className="close-btn" onClick={() => setIsOpen(false)}>
                <X size={18} />
              </button>
            </div>

            <div className="modal-body">
              <p className="text-xs text-gray-300 mb-3">
                Sync music playback, steering wheel controls, or remote cassette deck across all connected phones and truck dashboards.
              </p>

              <div className="qr-box shadow-inner">
                <QrCode size={90} className="qr-icon" />
                <div className="qr-info">
                  <span className="qr-title">Scan QR with Phone Camera</span>
                  <span className="qr-desc">Control cassette deck remotely from back seat or cabin</span>
                </div>
              </div>

              <h4 className="text-xs font-semibold text-gray-400 uppercase tracking-wider mb-2">Active Linked Devices</h4>

              <div className="device-list">
                {devices.map((dev) => (
                  <div key={dev.id} className="device-row">
                    <div className="device-icon">
                      {dev.type === 'dash' && <Gauge size={18} />}
                      {dev.type === 'mobile' && <Smartphone size={18} />}
                      {dev.type === 'desktop' && <Monitor size={18} />}
                    </div>
                    <div className="device-details">
                      <span className="device-name">{dev.name}</span>
                      <span className="device-meta">Latency: {dev.latency} • {dev.status}</span>
                    </div>
                    <span className="device-badge">
                      <CheckCircle2 size={14} className="text-emerald-400" />
                      CONNECTED
                    </span>
                  </div>
                ))}
              </div>
            </div>
          </div>
        </div>
      )}
    </>
  );
}
