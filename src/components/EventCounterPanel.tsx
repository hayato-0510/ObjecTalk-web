import React from 'react';

interface EventCounterPanelProps {
  eventCounts: Map<string, number>;
}

const EventCounterPanel: React.FC<EventCounterPanelProps> = ({ eventCounts }) => {
  const sortedEntries = Array.from(eventCounts.entries()).sort((a, b) => b[1] - a[1]);

  return (
    <div id="eventPanel" aria-live="polite" title="受信イベントの種類と回数">
      <h3>受信イベント（回数）</h3>
      <table id="eventTable">
        <tbody>
          {sortedEntries.length === 0 ? (
            <tr>
              <td colSpan={2} style={{ fontStyle: 'italic', color: '#666' }}>まだイベントが受信されていません。</td>
            </tr>
          ) : (
            sortedEntries.map(([name, count]) => (
              <tr key={name}>
                <td className="name">{name}</td>
                <td className="count">{String(count)}</td>
              </tr>
            ))
          )}
        </tbody>
      </table>
    </div>
  );
};

export default EventCounterPanel;
