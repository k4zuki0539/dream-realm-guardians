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
        // ローディング画面表示
        showLoadingScreen();
        
        console.log('🔄 Step 1: Creating CSV loader...');
        const csvLoader = new CSVLoader();
        console.log('✅ Step 1 completed');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Step 2: Creating game engine...');
        gameEngine = createGameEngine(csvLoader);
        console.log('✅ Step 2 completed');
        await new Promise(resolve => setTimeout(resolve, 500));
        
        console.log('🔄 Step 3: Initializing game engine...');
        try {
            await gameEngine.initialize();
            console.log('✅ Step 3 completed - Game engine initialized successfully');
        } catch (error) {
            console.warn('⚠️ Step 3 had issues:', error.message);
            console.error('Full error:', error);
            // 画像読み込みエラーは無視して続行
        }
        await new Promise(resolve => setTimeout(resolve, 500));
        
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
            particles: particleSystem
        };
        
        gameInitialized = true;
        
        console.log('✅ Dream Realm Guardians initialized successfully!');
        
        // UIテキストを更新
        updateUITexts();
        
        // タイトル画面のBGM開始
        if (audioManager) {
            audioManager.playBGM('bgm_title');
        }
        
        // ローディング完了、タイトル画面を表示
        hideLoadingScreen();
        showTitleScreen();
        
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
 * UIテキストを更新
 */
function updateUITexts() {
    try {
        if (!gameEngine.gameData.uiTexts) {
            console.warn('⚠️ UI texts not loaded');
            return;
        }
        
        console.log('📝 Updating UI texts...');
        
        // ゲームタイトルを更新
        const gameTitle = gameEngine.gameData.uiTexts.get('game_title');
        if (gameTitle) {
            const loadingTitle = document.getElementById('loading-title');
            const mainTitle = document.getElementById('main-title');
            
            if (loadingTitle) {
                loadingTitle.textContent = gameTitle.textJp;
            }
            
            if (mainTitle) {
                mainTitle.textContent = gameTitle.textJp;
                mainTitle.style.color = gameTitle.color;
                mainTitle.style.fontSize = gameTitle.fontSize + 'px';
            }
            
            // ページタイトルも更新
            document.title = `${gameTitle.textJp} - ${gameTitle.textEn}`;
            
            console.log(`📝 Title updated to: ${gameTitle.textJp}`);
        }
        
        // サブタイトルを更新
        const gameSubtitle = gameEngine.gameData.uiTexts.get('game_subtitle');
        if (gameSubtitle) {
            const subtitleElement = document.querySelector('.title-subtitle');
            if (subtitleElement) {
                subtitleElement.textContent = gameSubtitle.textJp;
            }
        }
        
        console.log('✅ UI texts updated successfully');
        
    } catch (error) {
        console.error('❌ Failed to update UI texts:', error);
    }
}

console.log('🎮 Main game script loaded - Ready to initialize!');