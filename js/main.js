/**
 * Main Entry Point - 夢境の守護者
 * ゲーム初期化とメイン制御
 */

// ゲーム開始フラグ
let gameInitialized = false;
let gameInstance = null;
let gameEngine = null;

// 初期化完了を待つ
document.addEventListener('DOMContentLoaded', async () => {
    // ローディング画面を確実に非表示にする
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
    }
    console.log('🚀 Starting Dream Realm Guardians...');
    
    // 初期化タイムアウト（10秒）
    const initTimeout = setTimeout(() => {
        console.error('⏰ Initialization timeout!');
        console.log('🔍 Current state when timeout occurred:');
        console.log('  - gameEngine:', typeof gameEngine);
        console.log('  - csvLoader available:', typeof CSVLoader);
        console.log('  - createGameEngine available:', typeof createGameEngine);
        showErrorScreen('初期化がタイムアウトしました', 'ゲームの読み込みに時間がかかりすぎています');
    }, 10000);
    
    try {
        // ローディング画面を強制非表示
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.style.display = 'none';
        }
        
        // ローディング画面をスキップして直接初期化開始
        
        console.log('🔄 Step 1: Creating CSV loader...');
        const csvLoader = new CSVLoader();
        console.log('✅ Step 1 completed');
        // ローディング画面をスキップしたため、遅延不要
        // await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Step 2: Creating game engine...');
        gameEngine = createGameEngine(csvLoader);
        console.log('✅ Step 2 completed');
        // ローディング画面をスキップしたため、遅延不要
        // await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Step 3: Initializing game engine...');
        try {
            await gameEngine.initialize();
            console.log('✅ Step 3 completed - Game engine initialized successfully');
            
            // ローディング画面をスキップしたため、タイトル更新も不要
            // updateLoadingScreenTitle();
        } catch (error) {
            console.warn('⚠️ Step 3 had issues:', error.message);
            console.error('Full error:', error);
            // 画像読み込みエラーは無視して続行
        }
        // ローディング画面をスキップしたため、遅延不要
        // await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Step 4: Initializing subsystems...');
        try {
            await initializeSubSystems();
            console.log('✅ Subsystems initialized successfully');
        } catch (error) {
            console.warn('⚠️ Subsystem initialization had issues:', error.message);
            // エラーがあっても続行
        }
        
        console.log('🔄 Step 5: Generating placeholder images...');
        generatePlaceholderImages();
        
        console.log('🔄 Step 6: Setting up error handlers...');
        setupImageErrorHandlers();
        
        // ゲームインスタンスを保存
        gameInstance = {
            engine: gameEngine,
            dialog: dialogSystem,
            battle: battleSystem,
            audio: audioManager,
            particles: particleSystem,
            shopMap: window.shopMapController
        };
        
        gameInitialized = true;
        
        console.log('✅ Dream Realm Guardians initialized successfully!');
        
        // UIテキストを更新
        updateUITexts();
        
        // タイトル画面のBGM開始
        if (audioManager) {
            audioManager.playBGM('bgm_title');
        }
        
        // ローディング画面をスキップして直接タイトル画面を表示
        // hideLoadingScreen();
        showTitleScreen();
        
        console.log('🔄 Step 7: Setting up menu button handlers...');
        console.log('🕐 Current time before setupMenuButtonHandlers:', new Date().toISOString());
        
        // Add a small delay to ensure DOM is fully ready
        setTimeout(() => {
            console.log('🕐 Setting up menu handlers after timeout');
            setupMenuButtonHandlers();
            
            // Add immediate test
            console.log('🧪 Testing button immediately after setup...');
            testButtonSetup();
            
            // Add backup handler as failsafe
            addBackupButtonHandler();
        }, 100);
        
        console.log('🎉 Game fully loaded and ready!');
        
        // タイムアウトをクリア
        clearTimeout(initTimeout);
        
    } catch (error) {
        clearTimeout(initTimeout);
        console.error('❌ Failed to initialize game:', error);
        showErrorScreen('ゲームの初期化に失敗しました', error.message);
    }
});

/**
 * サブシステムを初期化
 */
async function initializeSubSystems() {
    console.log('🔧 Initializing subsystems...');
    
    // オーディオマネージャー初期化
    if (typeof AudioManager !== 'undefined') {
        window.audioManager = new AudioManager();
        await window.audioManager.initialize();
    }
    
    // パーティクルシステム初期化
    if (typeof ParticleSystem !== 'undefined') {
        window.particleSystem = new ParticleSystem();
        window.particleSystem.initialize();
    }
    
    // 会話システム初期化
    window.dialogSystem = initializeDialogSystem(gameEngine);
    
    // バトルシステム初期化
    window.battleSystem = initializeBattleSystem(gameEngine);
    
    // エンディングシステム初期化
    if (typeof EndingSystem !== 'undefined') {
        window.endingSystem = new EndingSystem(gameEngine);
        await window.endingSystem.initialize();
    }
    
    // ネオン演出システム初期化
    if (typeof NeonTransition !== 'undefined') {
        window.neonTransition = new NeonTransition(gameEngine);
        window.neonTransition.initialize();
    }
    
    // 店内マップシステム初期化
    if (typeof ShopMapController !== 'undefined') {
        window.shopMapController = new ShopMapController();
        window.shopMapController.initialize();
        console.log('✅ Shop map controller initialized');
    }
    
    console.log('✅ Subsystems initialized');
}

/**
 * プレースホルダー画像を生成
 */
function generatePlaceholderImages() {
    console.log('🖼️ Generating placeholder images...');
    
    const placeholders = [
        // キャラクター画像
        { selector: '#title-character', width: 200, height: 400, text: '主人公', color: '#FFB6C1' },
        { selector: '#character-npc', width: 300, height: 600, text: 'ルシード', color: '#87CEEB' },
        { selector: '#character-protag', width: 300, height: 600, text: '夢野希', color: '#FFB6C1' },
        { selector: '#player-sprite', width: 80, height: 120, text: 'プレイヤー', color: '#FFB6C1' },
        { selector: '#ending-character', width: 250, height: 500, text: 'エンディング', color: '#FFD700' },
        
        // 敵画像
        { selector: '#enemy-sprite', width: 250, height: 250, text: '悪夢の化身', color: '#8B0000' },
        
        // 背景画像
        { selector: '#dialog-bg', width: 1024, height: 768, text: '幻想的な背景', color: '#483D8B' },
        { selector: '#battle-bg', width: 1024, height: 768, text: '悪夢の世界', color: '#2F4F4F' },
        { selector: '#ending-bg', width: 1024, height: 768, text: 'エンディング背景', color: '#FFD700' }
    ];
    
    placeholders.forEach(placeholder => {
        const element = document.querySelector(placeholder.selector);
        if (element && element.tagName === 'IMG') {
            element.src = generatePlaceholderDataURL(
                placeholder.width, 
                placeholder.height, 
                placeholder.text, 
                placeholder.color
            );
        }
    });
    
    console.log('✅ Placeholder images generated');
}

/**
 * プレースホルダー画像のData URLを生成
 */
function generatePlaceholderDataURL(width, height, text, color = '#CCCCCC') {
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    
    canvas.width = width;
    canvas.height = height;
    
    // 背景
    const gradient = ctx.createLinearGradient(0, 0, width, height);
    gradient.addColorStop(0, color);
    gradient.addColorStop(1, darkenColor(color, 20));
    
    ctx.fillStyle = gradient;
    ctx.fillRect(0, 0, width, height);
    
    // ボーダー
    ctx.strokeStyle = darkenColor(color, 40);
    ctx.lineWidth = 2;
    ctx.strokeRect(1, 1, width - 2, height - 2);
    
    // テキスト
    ctx.fillStyle = '#FFFFFF';
    ctx.font = `${Math.min(width, height) / 10}px Arial`;
    ctx.textAlign = 'center';
    ctx.textBaseline = 'middle';
    ctx.fillText(text, width / 2, height / 2);
    
    // サイズ表示
    ctx.fillStyle = 'rgba(255, 255, 255, 0.7)';
    ctx.font = `${Math.min(width, height) / 20}px Arial`;
    ctx.fillText(`${width}×${height}`, width / 2, height / 2 + Math.min(width, height) / 8);
    
    return canvas.toDataURL();
}

/**
 * 色を暗くする
 */
function darkenColor(color, percent) {
    const num = parseInt(color.slice(1), 16);
    const amt = Math.round(2.55 * percent);
    const R = (num >> 16) - amt;
    const G = (num >> 8 & 0x00FF) - amt;
    const B = (num & 0x0000FF) - amt;
    return '#' + (0x1000000 + (R < 255 ? R < 1 ? 0 : R : 255) * 0x10000 +
        (G < 255 ? G < 1 ? 0 : G : 255) * 0x100 +
        (B < 255 ? B < 1 ? 0 : B : 255)).toString(16).slice(1);
}

/**
 * ローディング画面表示
 */
function showLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.remove('hidden');
        
        // プログレスバーアニメーション
        const progressBar = document.querySelector('.loading-progress');
        if (progressBar) {
            progressBar.style.animation = 'loading-progress 3s ease-in-out forwards';
        }
    }
}

/**
 * ローディング画面を隠す
 */
function hideLoadingScreen() {
    const loadingScreen = document.getElementById('loading-screen');
    if (loadingScreen) {
        loadingScreen.classList.add('hidden');
        console.log('🔄 Loading screen hidden');
    }
}

/**
 * タイトル画面を表示
 */
function showTitleScreen() {
    // 全ての画面を隠す
    document.querySelectorAll('.screen').forEach(screen => {
        screen.classList.remove('active');
    });
    
    // タイトル画面を表示
    const titleScreen = document.getElementById('title-screen');
    if (titleScreen) {
        titleScreen.classList.add('active');
        console.log('🎮 Title screen shown');
    }
}

/**
 * エラー画面表示
 */
function showErrorScreen(message, details) {
    const errorHTML = `
        <div class="error-screen" style="
            position: fixed;
            top: 0;
            left: 0;
            width: 100vw;
            height: 100vh;
            background: linear-gradient(135deg, #1a1a2e, #16213e);
            color: white;
            display: flex;
            flex-direction: column;
            justify-content: center;
            align-items: center;
            text-align: center;
            font-family: 'Noto Sans JP', sans-serif;
            z-index: 10000;
        ">
            <h2 style="color: #FF6B6B; margin-bottom: 2rem; font-size: 2rem;">
                ❌ エラーが発生しました
            </h2>
            <p style="margin-bottom: 2rem; font-size: 1.2rem; max-width: 600px;">
                ${message}
            </p>
            <details style="margin-bottom: 2rem; max-width: 800px;">
                <summary style="cursor: pointer; color: #FFD700; margin-bottom: 1rem;">
                    詳細情報を表示
                </summary>
                <pre style="
                    background: rgba(0, 0, 0, 0.5);
                    padding: 1rem;
                    border-radius: 8px;
                    text-align: left;
                    white-space: pre-wrap;
                    word-wrap: break-word;
                    font-size: 0.9rem;
                ">${details}</pre>
            </details>
            <button onclick="location.reload()" style="
                background: linear-gradient(135deg, #4169E1, #FFD700);
                border: none;
                border-radius: 25px;
                padding: 1rem 2rem;
                color: white;
                font-size: 1.1rem;
                cursor: pointer;
                transition: transform 0.3s ease;
            " onmouseover="this.style.transform='scale(1.05)'" 
               onmouseout="this.style.transform='scale(1)'">
                🔄 ページを再読み込み
            </button>
        </div>
    `;
    
    document.body.insertAdjacentHTML('beforeend', errorHTML);
}

/**
 * 画像読み込みエラーハンドラー設定
 */
function setupImageErrorHandlers() {
    // 全ての画像要素にエラーハンドラーを設定
    document.querySelectorAll('img').forEach(img => {
        img.addEventListener('error', function(e) {
            console.warn(`⚠️ Image failed to load: ${this.src}`);
            // プレースホルダー画像を生成
            this.src = generatePlaceholderDataURL(
                this.width || 200, 
                this.height || 200, 
                'No Image', 
                '#666666'
            );
        });
    });
    
    // 動的に追加される画像にも対応
    const observer = new MutationObserver(mutations => {
        mutations.forEach(mutation => {
            mutation.addedNodes.forEach(node => {
                if (node.tagName === 'IMG') {
                    node.addEventListener('error', function(e) {
                        console.warn(`⚠️ Dynamic image failed to load: ${this.src}`);
                        this.src = generatePlaceholderDataURL(200, 200, 'No Image', '#666666');
                    });
                }
            });
        });
    });
    
    observer.observe(document.body, { childList: true, subtree: true });
    console.log('🔧 Image error handlers set up');
}

/**
 * メニューボタンハンドラー設定
 */
function setupMenuButtonHandlers() {
    console.log('🔧 Setting up menu button handlers...');
    
    // 新しいゲーム
    const newGameBtn = document.getElementById('btn-new-game');
    console.log('🔍 New game button element:', newGameBtn);
    
    if (newGameBtn) {
        console.log('✅ New game button found, adding event listener');
        
        newGameBtn.addEventListener('click', (event) => {
            console.log('🎮 New game button clicked');
            
            // Prevent any default behavior
            event.preventDefault();
            event.stopPropagation();
            
            startNewGame();
        });
        
        console.log('✅ Event listener attached to new game button');
    } else {
        console.error('❌ New game button not found!');
        console.log('🔍 All elements with btn-new-game id:', document.querySelectorAll('#btn-new-game'));
        console.log('🔍 All elements with menu-button class:', document.querySelectorAll('.menu-button'));
    }
    
    // 記憶を辿る（続きから）
    const continueBtn = document.getElementById('btn-continue');
    console.log('🔍 Continue button element:', continueBtn);
    if (continueBtn) {
        continueBtn.addEventListener('click', () => {
            console.log('📖 Continue button clicked');
            loadSavedGame();
        });
        console.log('✅ Continue button event listener attached');
    } else {
        console.error('❌ Continue button not found!');
    }
    
    // 設定
    const optionsBtn = document.getElementById('btn-options');
    console.log('🔍 Options button element:', optionsBtn);
    if (optionsBtn) {
        optionsBtn.addEventListener('click', () => {
            console.log('⚙️ Options button clicked');
            showOptionsMenu();
        });
        console.log('✅ Options button event listener attached');
    } else {
        console.error('❌ Options button not found!');
    }
    
    // 覚醒（終了）
    const exitBtn = document.getElementById('btn-exit');
    console.log('🔍 Exit button element:', exitBtn);
    if (exitBtn) {
        exitBtn.addEventListener('click', () => {
            console.log('🌅 Exit button clicked');
            exitGame();
        });
        console.log('✅ Exit button event listener attached');
    } else {
        console.error('❌ Exit button not found!');
    }
    
    console.log('🎮 Menu button handlers setup completed');
}

/**
 * バックアップボタンハンドラー（フェイルセーフ）
 */
function addBackupButtonHandler() {
    console.log('🛡️ Adding backup button handlers as failsafe...');
    
    const newGameBtn = document.getElementById('btn-new-game');
    if (newGameBtn) {
        console.log('🛡️ New game button found for backup handlers');
        
        // Method 1: onclick property backup
        if (!newGameBtn.onclick) {
            newGameBtn.onclick = function(event) {
                console.log('🛡️ Backup onclick handler triggered!');
                event.preventDefault();
                event.stopPropagation();
                startNewGame();
            };
            console.log('✅ Backup onclick handler set');
        }
        
        // Method 2: Additional event listener  
        newGameBtn.addEventListener('click', function(event) {
            console.log('🛡️ Backup addEventListener handler triggered!');
        }, { once: false });
        
        // Method 3: Global document click handler
        document.addEventListener('click', function(event) {
            if (event.target && (event.target.id === 'btn-new-game' || event.target.closest('#btn-new-game'))) {
                console.log('🛡️ Global document click handler caught new game button!');
                
                if (!event._gameHandled) {
                    event._gameHandled = true;
                    console.log('🛡️ Global handler calling startNewGame...');
                    startNewGame();
                }
            }
        }, true);
        
        console.log('✅ All backup handlers installed');
    } else {
        console.error('❌ Cannot install backup handlers - button not found');
    }
}

/**
 * ボタンセットアップテスト関数
 */
function testButtonSetup() {
    console.log('🧪 ========== TESTING BUTTON SETUP ==========');
    
    const newGameBtn = document.getElementById('btn-new-game');
    console.log('🔍 Button element:', newGameBtn);
    
    if (newGameBtn) {
        console.log('🔍 Button details:');
        console.log('  - ID:', newGameBtn.id);
        console.log('  - Classes:', newGameBtn.classList.toString());
        console.log('  - Text content:', newGameBtn.textContent);
        console.log('  - Parent element:', newGameBtn.parentElement);
        console.log('  - Event listeners:', getEventListeners ? getEventListeners(newGameBtn) : 'getEventListeners not available');
        console.log('  - onclick property:', typeof newGameBtn.onclick);
        console.log('  - Computed style display:', getComputedStyle(newGameBtn).display);
        console.log('  - Computed style visibility:', getComputedStyle(newGameBtn).visibility);
        console.log('  - offsetWidth/Height:', newGameBtn.offsetWidth, 'x', newGameBtn.offsetHeight);
    } else {
        console.error('❌ Button element not found!');
        console.log('🔍 Searching for alternatives:');
        console.log('  - All buttons:', document.querySelectorAll('button'));
        console.log('  - Elements with btn-new-game:', document.querySelectorAll('[id*="btn-new-game"]'));
        console.log('  - Elements with menu-button class:', document.querySelectorAll('.menu-button'));
    }
}

/**
 * 手動ボタンクリック（デバッグ用）
 */
function debugClickButton() {
    console.log('🧪 Manual button click test...');
    const btn = document.getElementById('btn-new-game');
    if (btn) {
        console.log('🧪 Triggering click on button...');
        btn.click();
    } else {
        console.error('❌ Button not found for manual click');
    }
}

/**
 * 新しいゲーム開始
 */
function startNewGame() {
    console.log('🎮 Starting new game...');
    console.log('🔍 Debug info:');
    console.log('  - gameEngine available:', !!gameEngine);
    console.log('  - neonTransition available:', !!window.neonTransition);
    console.log('  - shopMapController available:', !!window.shopMapController);
    
    if (gameEngine) {
        // ゲーム状態をリセット
        gameEngine.resetGameState();
        
        // ネオン演出を開始
        if (window.neonTransition) {
            console.log('🎬 Starting neon transition...');
            try {
                window.neonTransition.start();
            } catch (error) {
                console.error('❌ Error starting neon transition:', error);
                // フォールバック
                console.log('🔄 Falling back to dialog scene');
                gameEngine.transitionToScene('dialog');
            }
        } else {
            console.warn('⚠️ Neon transition not available, falling back to dialog');
            // フォールバック: 直接ダイアログ画面に遷移
            console.log('🎬 Attempting to transition to dialog scene...');
            
            try {
                gameEngine.transitionToScene('dialog');
                console.log('✅ Successfully transitioned to dialog scene');
            } catch (error) {
                console.error('❌ Error transitioning to dialog scene:', error);
            }
            
            setTimeout(() => {
                if (window.dialogSystem) {
                    console.log('🎬 Starting intro dialog...');
                    try {
                        window.dialogSystem.startDialog('intro_1');
                        console.log('✅ Successfully started intro dialog');
                    } catch (error) {
                        console.error('❌ Error starting intro dialog:', error);
                    }
                } else {
                    console.error('❌ Dialog system not available');
                    console.log('🔧 Showing basic dialog as fallback');
                    showBasicDialog('ゲームが開始されました', 'intro_1');
                }
            }, 500);
        }
    } else {
        console.error('❌ Game engine not available!');
        console.log('🔍 Available global variables:');
        console.log('  - window.gameEngine:', window.gameEngine);
        console.log('  - window.gameInstance:', window.gameInstance);
        console.log('  - gameEngine variable:', gameEngine);
        
        // Show alert as debugging fallback
        alert('デバッグ: startNewGame() が呼ばれましたが、gameEngineが利用できません。');
    }
    
    console.log('🎮 ========== START NEW GAME FUNCTION END ==========');
}

/**
 * セーブデータロード
 */
function loadSavedGame() {
    console.log('📖 Loading saved game...');
    
    if (gameEngine) {
        const saveData = gameEngine.loadGame();
        if (saveData) {
            console.log('✅ Game loaded successfully');
            // 保存されたシーンに遷移
            gameEngine.transitionToScene(saveData.currentScene || 'dialog');
        } else {
            console.log('⚠️ No save data found, starting new game');
            startNewGame();
        }
    }
}

/**
 * 設定メニュー表示
 */
function showOptionsMenu() {
    console.log('⚙️ Showing options menu...');
    
    // 設定画面要素があるかチェック
    const optionsScreen = document.getElementById('options-screen');
    if (optionsScreen) {
        // 全画面を隠す
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // 設定画面を表示
        optionsScreen.classList.add('active');
    } else {
        console.warn('⚠️ Options screen not implemented yet');
        alert('設定画面は現在開発中です。');
    }
}

/**
 * ゲーム終了
 */
function exitGame() {
    console.log('🌅 Exiting game...');
    
    const confirmed = confirm('ゲームを終了しますか？\n進行状況は自動的に保存されます。');
    if (confirmed) {
        // 自動セーブ
        if (gameEngine) {
            gameEngine.saveGame();
        }
        
        // Electronの場合はウィンドウを閉じる
        if (window.electronAPI) {
            window.electronAPI.closeWindow();
        } else {
            // ブラウザの場合は確認
            window.close();
        }
    }
}

/**
 * 基本ダイアログ表示（フォールバック用）
 */
function showBasicDialog(message, sceneId) {
    console.log(`💬 Showing basic dialog: ${message} (scene: ${sceneId})`);
    
    // ダイアログメッセージ要素を取得
    const messageElement = document.getElementById('dialog-message');
    if (messageElement) {
        messageElement.textContent = message;
    }
    
    // キャラクター名を設定
    const nameElement = document.getElementById('dialog-character-name');
    if (nameElement) {
        nameElement.textContent = '夢野希';
    }
    
    // 次へボタンを表示
    const nextBtn = document.getElementById('btn-next-dialog');
    if (nextBtn) {
        nextBtn.style.display = 'block';
        nextBtn.onclick = () => {
            console.log('Dialog next button clicked');
            // 次のダイアログまたはシーンへ
            if (gameEngine) {
                gameEngine.transitionToScene('battle'); // テスト用
            }
        };
    }
}

/**
 * デバッグ用: ゲーム状態表示
 */
function showGameState() {
    if (gameInstance && gameInstance.engine) {
        console.table({
            'Current Scene': gameInstance.engine.gameState.currentScene,
            'Player Level': gameInstance.engine.gameState.playerData.level,
            'Hope': gameInstance.engine.gameState.playerData.hope,
            'Empathy': gameInstance.engine.gameState.playerData.empathy,
            'Despair': gameInstance.engine.gameState.playerData.despair,
            'Loneliness': gameInstance.engine.gameState.playerData.loneliness,
            'Saved Count': gameInstance.engine.gameState.playerData.savedCount,
            'In Battle': gameInstance.engine.gameState.battleState.inBattle
        });
    }
}

/**
 * デバッグ用: 直接シーン遷移
 */
function debugTransition(sceneId) {
    if (gameInstance && gameInstance.engine) {
        gameInstance.engine.transitionToScene(sceneId);
    }
}

/**
 * デバッグ用: 感情値変更
 */
function debugEmotion(emotion, value) {
    if (gameInstance && gameInstance.engine) {
        gameInstance.engine.updateEmotion(emotion, value);
    }
}

/**
 * デバッグ用: バトル開始
 */
function debugBattle(enemyId = 'nightmare_despair') {
    if (gameInstance && gameInstance.battle) {
        gameInstance.battle.startBattle(enemyId);
    }
}

// グローバル関数として公開（デバッグ用）
window.showGameState = showGameState;
window.debugTransition = debugTransition;
window.debugEmotion = debugEmotion;
window.debugBattle = debugBattle;
window.gameInstance = gameInstance;

// パフォーマンス監視
let lastFrameTime = performance.now();
let frameCount = 0;

function monitorPerformance() {
    frameCount++;
    const now = performance.now();
    
    if (now - lastFrameTime >= 1000) {
        const fps = Math.round(frameCount * 1000 / (now - lastFrameTime));
        
        if (fps < 30) {
            console.warn(`⚠️ Low FPS detected: ${fps}`);
        }
        
        frameCount = 0;
        lastFrameTime = now;
    }
    
    requestAnimationFrame(monitorPerformance);
}

// パフォーマンス監視開始
monitorPerformance();

// ページ離脱時の処理
window.addEventListener('beforeunload', (e) => {
    if (gameInstance && gameInstance.engine && gameInstance.engine.gameState.gameStarted) {
        // 自動セーブ
        gameInstance.engine.saveGame();
        
        e.preventDefault();
        e.returnValue = 'ゲームの進行が保存されていない可能性があります。本当に離れますか？';
    }
});

// エラーハンドリング
window.addEventListener('error', (e) => {
    console.error('💥 Global error caught:', e.error);
    
    if (!gameInitialized) {
        showErrorScreen(
            'ゲームの読み込み中にエラーが発生しました', 
            e.error ? e.error.stack : e.message
        );
    }
});

window.addEventListener('unhandledrejection', (e) => {
    console.error('💥 Unhandled promise rejection:', e.reason);
    
    if (!gameInitialized) {
        showErrorScreen(
            'ゲームの初期化中に問題が発生しました', 
            e.reason ? e.reason.stack || e.reason.message : 'Unknown error'
        );
    }
    
    e.preventDefault();
});

/**
 * ローディング画面のタイトルを更新
 */
function updateLoadingScreenTitle() {
    try {
        if (gameEngine && gameEngine.gameData && gameEngine.gameData.uiTexts) {
            // ローディングタイトルを更新
            const loadingTitle_data = gameEngine.gameData.uiTexts.get('loading_title');
            if (loadingTitle_data) {
                const loadingTitle = document.getElementById('loading-title');
                if (loadingTitle) {
                    loadingTitle.textContent = loadingTitle_data.textJp;
                    console.log(`📝 Loading screen title updated to: ${loadingTitle_data.textJp}`);
                }
            }
            
            // ローディングメッセージを更新
            const loadingMessage_data = gameEngine.gameData.uiTexts.get('loading_message');
            if (loadingMessage_data) {
                const loadingMessage = document.getElementById('loading-message');
                if (loadingMessage) {
                    loadingMessage.textContent = loadingMessage_data.textJp;
                    console.log(`📝 Loading screen message updated to: ${loadingMessage_data.textJp}`);
                }
            }
        }
    } catch (error) {
        console.error('❌ Failed to update loading screen title:', error);
    }
}

/**
 * UIテキストを更新
 */
function updateUITexts() {
    try {
        console.log('📝 Attempting to update UI texts...');
        console.log('  - gameEngine available:', !!gameEngine);
        console.log('  - gameEngine.gameData available:', !!gameEngine?.gameData);
        console.log('  - uiTexts available:', !!gameEngine?.gameData?.uiTexts);
        
        if (!gameEngine || !gameEngine.gameData || !gameEngine.gameData.uiTexts) {
            console.warn('⚠️ UI texts not loaded');
            console.log('  - gameEngine:', gameEngine);
            console.log('  - gameData:', gameEngine?.gameData);
            console.log('  - uiTexts:', gameEngine?.gameData?.uiTexts);
            return;
        }
        
        console.log('📝 Updating UI texts...');
        console.log('  - Available UI texts:', Array.from(gameEngine.gameData.uiTexts.keys()));
        
        // ゲームタイトルを更新（メインタイトルのみ）
        const gameTitle = gameEngine.gameData.uiTexts.get('game_title');
        if (gameTitle) {
            const mainTitle = document.getElementById('main-title');
            
            if (mainTitle) {
                mainTitle.textContent = gameTitle.textJp;
                mainTitle.style.color = gameTitle.color;
                mainTitle.style.fontSize = gameTitle.fontSize + 'px';
            }
            
            // ページタイトルも更新
            document.title = `${gameTitle.textJp} - ${gameTitle.textEn}`;
            
            console.log(`📝 Main title updated to: ${gameTitle.textJp}`);
        }
        
        // サブタイトルを更新
        const gameSubtitle = gameEngine.gameData.uiTexts.get('game_subtitle');
        if (gameSubtitle) {
            const subtitleElement = document.querySelector('.title-subtitle');
            if (subtitleElement) {
                subtitleElement.textContent = gameSubtitle.textJp;
            }
        }
        
        // メニューボタンのテキストを更新
        const menuButtons = [
            { id: 'btn-new-game', textId: 'menu_new_game' },
            { id: 'btn-continue', textId: 'menu_continue' },
            { id: 'btn-options', textId: 'menu_options' },
            { id: 'btn-quit', textId: 'menu_exit' }
        ];
        
        menuButtons.forEach(button => {
            const buttonElement = document.getElementById(button.id);
            const textData = gameEngine.gameData.uiTexts.get(button.textId);
            
            if (buttonElement && textData) {
                const textSpan = buttonElement.querySelector('.btn-text') || buttonElement;
                textSpan.textContent = textData.textJp;
                console.log(`📝 Updated button ${button.id}: ${textData.textJp}`);
            }
        });
        
        console.log('✅ UI texts updated successfully');
        
    } catch (error) {
        console.error('❌ Failed to update UI texts:', error);
    }
}

/**
 * Test function to verify button setup
 */
function testButtonSetup() {
    console.log('🧪 ========== TESTING BUTTON SETUP ==========');
    
    const newGameBtn = document.getElementById('btn-new-game');
    console.log('🔍 Button element:', newGameBtn);
    console.log('🔍 Button classes:', newGameBtn?.classList.toString());
    console.log('🔍 Button data-action:', newGameBtn?.getAttribute('data-action'));
    console.log('🔍 Button innerHTML:', newGameBtn?.innerHTML);
    console.log('🔍 Button onclick:', newGameBtn?.onclick);
    console.log('🔍 Button event listeners (manual check):', newGameBtn?._eventListeners || 'Not available');
    
    // Test if we can manually trigger the event
    if (newGameBtn) {
        console.log('🧪 Attempting to manually trigger click event...');
        
        // Method 1: Direct click()
        setTimeout(() => {
            console.log('🧪 Method 1: Direct click() - IN 3 SECONDS');
            console.log('🧪 You can also try clicking the button manually now!');
        }, 1000);
        
        // Method 2: Dispatch event
        const clickEvent = new MouseEvent('click', {
            bubbles: true,
            cancelable: true,
            view: window
        });
        
        setTimeout(() => {
            console.log('🧪 Method 2: Dispatching click event...');
            newGameBtn.dispatchEvent(clickEvent);
        }, 5000);
    }
    
    console.log('🧪 ========== BUTTON TEST END ==========');
}

/**
 * Simple debug function to test button manually
 */
function debugClickButton() {
    console.log('🖱️ Manual button click test');
    const btn = document.getElementById('btn-new-game');
    if (btn) {
        btn.click();
    } else {
        console.error('Button not found for manual test');
    }
}

/**
 * Backup button handler - adds click handler using multiple methods
 */
function addBackupButtonHandler() {
    console.log('🛡️ Adding backup button handlers as failsafe...');
    
    const newGameBtn = document.getElementById('btn-new-game');
    if (newGameBtn) {
        // Method 1: onclick property (as backup)
        if (!newGameBtn.onclick) {
            newGameBtn.onclick = function(event) {
                console.log('🛡️ Backup onclick handler triggered!');
                event.preventDefault();
                event.stopPropagation();
                startNewGame();
            };
            console.log('🛡️ Backup onclick handler added');
        }
        
        // Method 2: Add another event listener (as another backup)
        newGameBtn.addEventListener('click', function(event) {
            console.log('🛡️ Backup addEventListener handler triggered!');
        }, { once: false });
        
        // Method 3: Add data-attribute handler
        newGameBtn.setAttribute('data-click-handler', 'startNewGame');
        
        // Method 4: Global click listener on document
        document.addEventListener('click', function(event) {
            if (event.target && (event.target.id === 'btn-new-game' || event.target.closest('#btn-new-game'))) {
                console.log('🛡️ Global document click handler caught new game button!');
                console.log('🛡️ Event target:', event.target);
                console.log('🛡️ Closest btn-new-game:', event.target.closest('#btn-new-game'));
                
                // Only trigger if we haven't already handled it
                if (!event._gameHandled) {
                    event._gameHandled = true;
                    console.log('🛡️ Global handler calling startNewGame...');
                    startNewGame();
                }
            }
        }, true); // Use capture phase
        
        console.log('✅ All backup handlers added');
    } else {
        console.error('❌ Cannot add backup handlers - button not found');
    }
}

// Make test functions globally available
window.testButtonSetup = testButtonSetup;
window.debugClickButton = debugClickButton;
window.addBackupButtonHandler = addBackupButtonHandler;
window.setupMenuButtonHandlers = setupMenuButtonHandlers;

console.log('🎮 Main game script loaded - Ready to initialize!');