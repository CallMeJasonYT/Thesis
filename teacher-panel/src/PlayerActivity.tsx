import React, { useEffect, useState } from 'react';
import WebSocketManager from './WebSocketManager';
import './PlayerActivity.css';

interface Player {
    id: number;
    username: string;
    online: boolean;
    lastSeen: number | null;
}

const PlayerActivity: React.FC<{ wsManager: WebSocketManager }> = ({ wsManager }) => {
    const [offlinePlayers, setOfflinePlayers] = useState<Player[]>([]);
    const [onlinePlayers, setOnlinePlayers] = useState<Player[]>([]);

    const fetchPlayers = async () => {
        try {
            const response = await fetch('http://localhost:3030/api/players');
            const data = await response.json();
            const offlinePlayersData = data.map((player: any) => ({
                id: player.id,
                username: player.username,
                online: false,
                lastSeen: null,
            }));
            setOfflinePlayers(offlinePlayersData);
        } catch (error) {
            console.error('Failed to fetch players:', error);
        }
    };

    useEffect(() => {
        fetchPlayers();

        const handlePlayerActivity = (event: Event) => {
            const customEvent = event as CustomEvent<{ playerId: number; username?: string }>;
            const { playerId, username } = customEvent.detail;

            if (customEvent.type === 'playerConnect') {
                setOfflinePlayers((prevOfflinePlayers) =>
                    prevOfflinePlayers.filter((player) => player.username !== username)
                );
                setOnlinePlayers((prevOnlinePlayers) => [
                    ...prevOnlinePlayers,
                    { id: playerId, username: username || 'Unknown', online: true, lastSeen: null },
                ]);
            } else if (customEvent.type === 'playerDisconnect') {
                setOnlinePlayers((prevPlayers) => prevPlayers.filter((player) => player.id !== playerId));
                fetchPlayers();
            }
        };

        wsManager.addEventListener('playerConnect', handlePlayerActivity);
        wsManager.addEventListener('playerDisconnect', handlePlayerActivity);

        return () => {
            wsManager.removeEventListener('playerConnect', handlePlayerActivity);
            wsManager.removeEventListener('playerDisconnect', handlePlayerActivity);
        };
    }, [wsManager]);

    return (
        <div className="player-activity">
            <h2>Player Activity</h2>

            <div className="player-section">
                <h3>Online Players</h3>
                {onlinePlayers.length === 0 ? (
                    <p>No players are online</p>
                ) : (
                    onlinePlayers.map((player) => (
                        <div key={player.id} className="player-card">
                            <h3>{player.username}</h3>
                            <div className="status">
                                <div className="status-dot online"></div>
                                <p>Online</p>
                            </div>
                        </div>
                    ))
                )}
            </div>

            <div className="player-section">
                <h3>Offline Players</h3>
                {offlinePlayers.length === 0 ? (
                    <p>No players have logged in yet</p>
                ) : (
                    offlinePlayers.map((player) => (
                        <div key={player.id} className="player-card">
                            <h3>{player.username}</h3>
                            <div className="status">
                                <div className="status-dot offline"></div>
                                <p>Offline</p>
                            </div>
                        </div>
                    ))
                )}
            </div>
        </div>
    );
};

export default PlayerActivity;
