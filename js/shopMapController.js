/**
 * Shop Map Controller - 店内マップ制御システム
 * プレイヤーの移動、ドアの相互作用、部屋への入室を管理
 */

class ShopMapController {
    constructor() {
        // DOM要素
        this.player = null;
        this.corridor = null;
        this.doors = [];
        this.minimapPlayer = null;
        this.messageBox = null;
        this.messageText = null;
        this.messageClose = null;
        this.roomDescription = null;
        
        // プレイヤーの状態（新レイアウトの初期位置：エントランス付近）
        this.playerPosition = { x: 60, y: window.innerHeight * 0.85 }; // 画面下部のエントランス
        this.isMoving = false;
        this.currentRoom = null;
        
        // 部屋データ（カラオケ個室店舗風に更新）
        this.roomData = {
            1: {
                name: "カラオケ個室A（101号室）",
                description: "標準的なカラオケ個室です。最新の機械とソファが設置されています。",
                color: "#27ae60",
                accessible: true,
                roomType: "karaoke"
            },
            2: {
                name: "カラオケ個室B（102号室）",
                description: "少し広めの個室です。グループでの利用に最適です。",
                color: "#3498db",
                accessible: true,
                roomType: "karaoke"
            },
            3: {
                name: "VIPルーム",
                description: "豪華な内装のVIP専用個室です。ミニバーや大型スクリーンを完備。",
                color: "#f1c40f",
                accessible: true,
                roomType: "vip"
            },
            4: {
                name: "プライベート個室（201号室）",
                description: "静かで落ち着いた雰囲気の個室です。プライベートな時間を過ごせます。",
                color: "#e67e22",
                accessible: true,
                roomType: "private"
            },
            5: {
                name: "秘密の部屋",
                description: "この店舗の奥に隠された謎めいた部屋です...",
                color: "#8a2be2",
                accessible: false,
                requiredCondition: "特別な認証が必要",
                roomType: "mystery"
            }
        };
        
        console.log('🗺️ Shop Map Controller initialized');
    }
    
    /**
     * システム初期化
     */
    initialize() {
        this._initializeElements();
        this._setupEventListeners();
        this._updatePlayerPosition();
        this._updateRoomDescription("エントランスにいます");
        
        console.log('🗺️ Shop Map Controller ready');
    }
    
    /**
     * DOM要素の初期化
     * @private
     */
    _initializeElements() {
        // プレイヤー要素
        this.player = document.getElementById('player');
        this.shopLayout = document.querySelector('.shop-layout');
        this.mainCorridor = document.querySelector('.main-corridor');
        
        // ドア要素（新しいセレクタに更新）
        this.doors = Array.from(document.querySelectorAll('.room-door'));
        
        // メッセージ要素
        this.messageBox = document.getElementById('shop-message');
        this.messageText = document.getElementById('message-text');
        this.messageClose = document.getElementById('message-close');
        
        // 情報要素
        this.roomDescription = document.getElementById('room-description');
        
        // 要素チェック
        if (!this.player || !this.shopLayout) {
            console.error('❌ Required shop map elements not found');
            console.log('🔍 Player element:', this.player);
            console.log('🔍 Shop layout element:', this.shopLayout);
        }
        
        console.log(`✅ Found ${this.doors.length} room doors`);
        console.log('🗺️ Shop layout elements initialized');
    }
    
    /**
     * イベントリスナー設定
     * @private
     */
    _setupEventListeners() {
        // 店舗レイアウト全体でのクリック - プレイヤー移動
        if (this.shopLayout) {
            this.shopLayout.addEventListener('click', (e) => {
                // ドアクリックやUI要素クリックを除外
                if (!e.target.closest('.room-door') && 
                    !e.target.closest('.shop-ui') && 
                    !e.target.closest('.shop-message')) {
                    
                    const rect = this.shopLayout.getBoundingClientRect();
                    const x = e.clientX - rect.left;
                    const y = e.clientY - rect.top;
                    this._movePlayerTo(x, y);
                }
            });
        }
        
        // ドアクリック - 部屋入室
        this.doors.forEach(door => {
            door.addEventListener('click', (e) => {
                e.stopPropagation();
                const roomId = parseInt(door.dataset.room);
                const roomName = door.dataset.name;
                this._enterRoom(roomId, roomName);
            });
            
            // ドアホバー効果
            door.addEventListener('mouseenter', (e) => {
                const roomId = parseInt(door.dataset.room);
                const roomData = this.roomData[roomId];
                if (roomData) {
                    this._updateRoomDescription(`${roomData.name}: ${roomData.description}`);
                }
            });
            
            door.addEventListener('mouseleave', (e) => {
                // 現在の位置に基づいた説明に戻す
                this._updateLocationDescription(this.playerPosition.x, this.playerPosition.y);
            });
        });
        
        // メッセージクローズ
        if (this.messageClose) {
            this.messageClose.addEventListener('click', () => {
                this._hideMessage();
            });
        }
        
        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape') {
                if (this.messageBox && !this.messageBox.classList.contains('hidden')) {
                    this._hideMessage();
                }
            }
        });
        
        // ミニマップドアクリック
        const minimapDoors = document.querySelectorAll('.minimap-door');
        minimapDoors.forEach(door => {
            door.addEventListener('click', (e) => {
                const roomId = parseInt(door.dataset.room);
                const mainDoor = document.getElementById(`door-${roomId}`);
                if (mainDoor) {
                    // メインドアの位置に移動してからクリック
                    const doorRect = mainDoor.getBoundingClientRect();
                    const corridorRect = this.corridor.getBoundingClientRect();
                    const relativeX = doorRect.left - corridorRect.left + 30;
                    const relativeY = doorRect.top - corridorRect.top + 50;
                    
                    this._movePlayerTo(relativeX, relativeY, () => {
                        // 移動完了後にドアをクリック
                        setTimeout(() => {
                            const roomData = this.roomData[roomId];
                            if (roomData) {
                                this._enterRoom(roomId, roomData.name);
                            }
                        }, 300);
                    });
                }
            });
        });
        
        console.log('✅ Event listeners setup completed');
    }
    
    /**
     * プレイヤーを指定位置に移動
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @param {Function} callback - 移動完了後のコールバック
     * @private
     */
    _movePlayerTo(x, y, callback = null) {
        if (this.isMoving) return;
        
        // 移動可能範囲をチェック（画面全体のレイアウトに対応）
        const layoutRect = this.shopLayout.getBoundingClientRect();
        const maxX = layoutRect.width - 30; // プレイヤーサイズ考慮
        const maxY = layoutRect.height - 30;
        
        // 最小位置も余裕を持たせる
        x = Math.max(30, Math.min(x, maxX));
        y = Math.max(30, Math.min(y, maxY));
        
        console.log(`🚶 Moving player to (${x}, ${y}) in realistic shop layout`);
        
        this.isMoving = true;
        this.playerPosition = { x, y };
        
        // プレイヤー移動アニメーション
        if (this.player) {
            this.player.classList.add('moving');
            this.player.style.left = `${x}px`;
            this.player.style.top = `${y}px`;
            
            setTimeout(() => {
                this.player.classList.remove('moving');
                this.isMoving = false;
                if (callback) callback();
                
                // 現在位置に基づいて説明を更新
                this._updateLocationDescription(x, y);
            }, 600); // 新しいアニメーション時間に合わせて調整
        }
        
        // 位置更新完了
        console.log(`✅ Player position updated to (${x}, ${y})`);
    }
    
    /**
     * ミニマッププレイヤー位置更新
     * @private
     */
    _updateMinimapPlayer() {
        if (!this.minimapPlayer) return;
        
        // メインマップの位置をミニマップにスケール
        const scaleX = 160 / 800; // ミニマップ幅 / メインマップ幅
        const scaleY = 60 / 400;  // ミニマップ高さ / メインマップ高さ
        
        const minimapX = this.playerPosition.x * scaleX;
        const minimapY = this.playerPosition.y * scaleY;
        
        this.minimapPlayer.style.left = `${minimapX}px`;
        this.minimapPlayer.style.top = `${minimapY}px`;
    }
    
    /**
     * プレイヤー位置初期化
     * @private
     */
    _updatePlayerPosition() {
        if (this.player) {
            this.player.style.left = `${this.playerPosition.x}px`;
            this.player.style.top = `${this.playerPosition.y}px`;
        }
        // 初期位置設定完了
        console.log(`✅ Player initial position set to (${this.playerPosition.x}, ${this.playerPosition.y})`);
    }
    
    /**
     * 部屋に入室
     * @param {number} roomId - 部屋ID
     * @param {string} roomName - 部屋名
     * @private
     */
    _enterRoom(roomId, roomName) {
        console.log(`🚪 Attempting to enter room ${roomId}: ${roomName}`);
        
        const roomData = this.roomData[roomId];
        
        if (!roomData) {
            this._showMessage("エラー", "部屋の情報が見つかりません。");
            return;
        }
        
        // アクセス権限チェック
        if (!roomData.accessible) {
            this._showMessage(
                `${roomName}`, 
                `この部屋は現在立入禁止です。\n${roomData.requiredCondition || "条件が満たされていません。"}`
            );
            return;
        }
        
        // 部屋入室処理
        this.currentRoom = roomId;
        
        // 部屋ごとの特別な処理（カラオケ個室店舗風に更新）
        let message = "";
        switch (roomId) {
            case 1:
                message = `${roomName}に入室しました。\n\n最新のカラオケ機械とふかふかのソファが設置された標準的な個室です。快適にカラオケを楽しめそうです。`;
                break;
            case 2:
                message = `${roomName}に入室しました。\n\n少し広めの空間で、グループでの利用に最適です。大型のテーブルとゆったりとしたソファが魅力的です。`;
                break;
            case 3:
                message = `${roomName}に入室しました。\n\n豪華な内装とミニバー、大型スクリーンが完備されたVIP専用個室です。特別な時間を過ごせそうです。`;
                break;
            case 4:
                message = `${roomName}に入室しました。\n\n静かで落ち着いた雰囲気のプライベート個室です。周囲を気にせずリラックスできる空間です。`;
                break;
            case 5:
                message = `${roomName}の扉に近づくと...\n\n神秘的な光が扉の隙間から漏れています。特別な認証が必要なようで、今は入ることができません。`;
                break;
        }
        
        this._showMessage(roomName, message);
        
        // Java側の処理を呼び出し（模擬）
        this._processRoomLogic(roomId, roomName);
    }
    
    /**
     * Java側の部屋ロジック処理（模擬）
     * @param {number} roomId - 部屋ID
     * @param {string} roomName - 部屋名
     * @private
     */
    _processRoomLogic(roomId, roomName) {
        // 実際の実装では、ここでJava側のMapLogic.javaを呼び出す
        // node-javaライブラリを使用した実装例：
        
        console.log('☕ Processing room logic with Java...');
        
        // 模擬Java処理結果
        setTimeout(() => {
            const javaResult = {
                success: true,
                roomId: roomId,
                message: `Java処理完了: ${roomName}の情報を取得しました`,
                additionalData: {
                    roomType: this.roomData[roomId]?.name || "Unknown",
                    timestamp: new Date().toISOString(),
                    playerActions: ["observe", "interact", "leave"]
                }
            };
            
            console.log('☕ Java processing result:', javaResult);
            
            // エラーハンドリング例
            if (!javaResult.success) {
                console.error('❌ Java processing failed:', javaResult.error);
                this._showMessage("エラー", "部屋の処理中にエラーが発生しました。");
            }
        }, 500);
    }
    
    /**
     * メッセージを表示
     * @param {string} title - タイトル
     * @param {string} message - メッセージ内容
     * @private
     */
    _showMessage(title, message) {
        if (this.messageBox && this.messageText) {
            this.messageText.innerHTML = `<strong>${title}</strong><br><br>${message.replace(/\n/g, '<br>')}`;
            this.messageBox.classList.remove('hidden');
            
            // 自動クローズ（長いメッセージの場合）
            if (message.length > 100) {
                setTimeout(() => {
                    if (!this.messageBox.classList.contains('hidden')) {
                        this._hideMessage();
                    }
                }, 8000);
            }
        }
    }
    
    /**
     * メッセージを非表示
     * @private
     */
    _hideMessage() {
        if (this.messageBox) {
            this.messageBox.classList.add('hidden');
        }
        this.currentRoom = null;
    }
    
    /**
     * 部屋の説明を更新
     * @param {string} description - 説明文
     * @private
     */
    _updateRoomDescription(description) {
        if (this.roomDescription) {
            this.roomDescription.textContent = description;
        }
    }
    
    /**
     * 現在位置に基づいて説明を更新
     * @param {number} x - X座標
     * @param {number} y - Y座標
     * @private
     */
    _updateLocationDescription(x, y) {
        const layoutHeight = window.innerHeight;
        const layoutWidth = window.innerWidth;
        
        let description = "店内を移動しています";
        
        // Y座標による位置判定（上から下へ）
        if (y < layoutHeight * 0.15) {
            description = "バックエリアにいます（スタッフルーム・倉庫付近）";
        } else if (y < layoutHeight * 0.8) {
            // 廊下エリア
            if (x < layoutWidth * 0.45) {
                description = "左側個室エリア付近を歩いています";
            } else if (x > layoutWidth * 0.55) {
                description = "右側個室エリア付近を歩いています";
            } else {
                description = "メイン廊下を歩いています";
            }
        } else {
            // エントランスエリア
            if (x < layoutWidth * 0.3) {
                description = "受付カウンター付近にいます";
            } else if (x > layoutWidth * 0.7) {
                description = "出入口付近にいます";
            } else {
                description = "エントランスにいます";
            }
        }
        
        this._updateRoomDescription(description);
    }
    
    /**
     * 特別な部屋のアクセス許可
     * @param {number} roomId - 部屋ID
     */
    unlockRoom(roomId) {
        if (this.roomData[roomId]) {
            this.roomData[roomId].accessible = true;
            console.log(`🔓 Room ${roomId} has been unlocked`);
            
            // 視覚的フィードバック
            const door = document.getElementById(`door-${roomId}`);
            if (door) {
                door.style.boxShadow = '0 0 20px rgba(241, 196, 15, 0.8)';
                setTimeout(() => {
                    door.style.boxShadow = '';
                }, 3000);
            }
        }
    }
    
    /**
     * 現在のプレイヤー位置を取得
     */
    getPlayerPosition() {
        return { ...this.playerPosition };
    }
    
    /**
     * 現在の部屋を取得
     */
    getCurrentRoom() {
        return this.currentRoom;
    }
    
    /**
     * システムのリセット
     */
    reset() {
        this.playerPosition = { x: 60, y: window.innerHeight * 0.85 };
        this.currentRoom = null;
        this.isMoving = false;
        
        this._updatePlayerPosition();
        this._updateRoomDescription("エントランスにいます");
        this._hideMessage();
        
        console.log('🔄 Shop map controller reset');
    }
}

// グローバルインスタンス
let shopMapController = null;

// 初期化用関数
function initializeShopMapController() {
    shopMapController = new ShopMapController();
    shopMapController.initialize();
    return shopMapController;
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.ShopMapController = ShopMapController;
    window.initializeShopMapController = initializeShopMapController;
}

console.log('🗺️ Shop Map Controller module loaded');