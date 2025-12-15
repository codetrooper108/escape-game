import React from 'react'
import './Inventory.css'

function Inventory({ items }) {
  return (
    <div className="inventory-container">
      <div className="inventory-header">
        <span className="inventory-icon">🎒</span>
        <span className="inventory-title">Inventory</span>
        <span className="inventory-count">({items.length})</span>
      </div>
      <div className="inventory-items">
        {items.length === 0 ? (
          <div className="inventory-empty">No items yet</div>
        ) : (
          items.map((item, idx) => (
            <div key={idx} className="inventory-item">
              {item.icon || '📦'} {item.name}
            </div>
          ))
        )}
      </div>
    </div>
  )
}

export default Inventory





