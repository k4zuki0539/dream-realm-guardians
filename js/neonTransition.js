/**
 * Neon Transition System - ネオン演出システム
 * タイトル画面からゲーム開始時の演出を管理
 */

class NeonTransition {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.audioManager = null;
        
        // 状態管理
        this.currentPhase = 'neon_scene'; // neon_scene, fade_out, blackout, audio, map_scene
        this.isPlaying = false;
        
        // DOM要素
        this.neonScreen = null;
        this.shopMapScreen = null;
        this.fadeOverlay = null;
        this.audioText = null;
        
        // タイミング制御
        this.fadeStartTime = 0;
        this.blackoutStartTime = 0;
        this.fadeSpeed = 2000; // 2秒でフェードアウト（短縮）
        this.blackoutDuration = 1000; // 1秒の暗転（短縮）
        
        console.log('🎬 Neon Transition System initialized');
    }
    
    /**
     * システム初期化
     */
    initialize() {
        this._initializeElements();
        this._setupEventListeners();
        
        // オーディオマネージャー取得
        if (window.audioManager) {
            this.audioManager = window.audioManager;
        }
        
        console.log('🎬 Neon Transition System ready');
    }
    
    /**
     * DOM要素の初期化
     * @private
     */
    _initializeElements() {
        this.neonScreen = document.getElementById('neon-transition-screen');
        this.shopMapScreen = document.getElementById('shop-map-screen');
        this.fadeOverlay = document.querySelector('.fade-overlay');
        this.audioText = document.querySelector('.audio-text');
        
        // 要素チェック
        if (!this.neonScreen || !this.shopMapScreen) {
            console.error('❌ Required neon transition elements not found');
        }
        
        // 初期状態を設定
        this._hideAllScreens();
    }
    
    /**
     * イベントリスナー設定
     * @private
     */
    _setupEventListeners() {
        // ESCキーで中止
        document.addEventListener('keydown', (e) => {
            if (e.key === 'Escape' && this.isPlaying) {
                this.stop();
            }
        });
        
        // クリックで演出スキップ（開発用）
        if (this.neonScreen) {
            this.neonScreen.addEventListener('click', () => {
                if (this.isPlaying && this.currentPhase === 'neon_scene') {
                    this._startFadeOut();
                }
            });
        }
    }
    
    /**
     * ネオン演出開始
     */
    async start() {
        if (this.isPlaying) {
            console.warn('⚠️ Neon transition already playing');
            return;
        }
        
        console.log('🎬 Starting neon transition');
        this.isPlaying = true;
        this.currentPhase = 'neon_scene';
        
        // 直接ネオン画面を表示
        this._showNeonScreen();
        
        // 自動でフェードアウトを開始（2秒後に短縮）
        setTimeout(() => {
            if (this.isPlaying && this.currentPhase === 'neon_scene') {
                this._startFadeOut();
            }
        }, 2000);
    }
    
    /**
     * フェードアウト開始
     * @private
     */
    _startFadeOut() {
        console.log('🌃 Starting fade out');
        this.currentPhase = 'fade_out';
        this.fadeStartTime = Date.now();
        
        // フェードオーバーレイを表示
        if (this.fadeOverlay) {
            this.fadeOverlay.classList.add('active');
        }
        
        // フェードアウト完了を監視
        setTimeout(() => {
            this._startBlackout();
        }, this.fadeSpeed);
    }
    
    /**
     * 暗転開始
     * @private
     */
    _startBlackout() {
        console.log('⚫ Starting blackout');
        this.currentPhase = 'blackout';
        this.blackoutStartTime = Date.now();
        
        // 暗転後に音声再生
        setTimeout(() => {
            this._playAudio();
        }, this.blackoutDuration);
    }
    
    /**
     * 音声再生
     * @private
     */
    _playAudio() {
        console.log('🔊 Playing welcome audio');
        this.currentPhase = 'audio';
        
        // 音声テキストを表示
        if (this.audioText) {
            this.audioText.classList.add('show');
        }
        
        // 音声ファイル再生の試行
        if (this.audioManager) {
            try {
                // welcome.mp3やwelcome.wavを再生
                this.audioManager.playVoice('welcome');
            } catch (error) {
                console.warn('⚠️ Audio playback failed:', error);
            }
        }
        
        // 音声再生時間（またはテキスト表示時間）後にマップ遷移
        setTimeout(() => {
            this._showMap();
        }, 1500); // 1.5秒後にマップへ（短縮）
    }
    
    /**
     * ネオン画面を表示
     * @private
     */
    _showNeonScreen() {
        // 全画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // ネオン画面を表示
        if (this.neonScreen) {
            this.neonScreen.classList.add('active');
        }
    }
    
    /**
     * マップ表示
     * @private
     */
    async _showMap() {
        console.log('🗺️ Showing shop map');
        this.currentPhase = 'map_scene';
        
        // 音声テキストを非表示
        if (this.audioText) {
            this.audioText.classList.remove('show');
        }
        
        // ネオン画面を非表示
        if (this.neonScreen) {
            this.neonScreen.classList.remove('active');
        }
        
        // マップ画面を表示
        if (this.shopMapScreen) {
            this.shopMapScreen.classList.add('active');
        }
        
        // 店内マップコントローラーをリセット/初期化
        if (window.shopMapController) {
            console.log('🗺️ Resetting shop map controller for new session');
            window.shopMapController.reset();
        } else {
            console.warn('⚠️ Shop map controller not available');
        }
        
        // マップでのイベントリスナー設定
        this._setupMapControls();
    }
    
    /**
     * マップ画面のコントロール設定
     * @private
     */
    _setupMapControls() {
        const mapKeyHandler = (e) => {
            if (e.key === 'Escape') {
                // タイトル画面に戻る
                this._returnToTitle();
                document.removeEventListener('keydown', mapKeyHandler);
                this.isPlaying = false;
            }
        };
        
        document.addEventListener('keydown', mapKeyHandler);
    }
    
    /**
     * タイトル画面に戻る
     * @private
     */
    _returnToTitle() {
        // 全画面を非表示
        document.querySelectorAll('.screen').forEach(screen => {
            screen.classList.remove('active');
        });
        
        // タイトル画面を表示
        const titleScreen = document.getElementById('title-screen');
        if (titleScreen) {
            titleScreen.classList.add('active');
        }
    }
    
    /**
     * 演出停止
     */
    stop() {
        console.log('🛑 Stopping neon transition');
        
        this.isPlaying = false;
        this.currentPhase = 'neon_scene';
        
        // 全要素をリセット
        if (this.fadeOverlay) {
            this.fadeOverlay.classList.remove('active');
        }
        
        if (this.audioText) {
            this.audioText.classList.remove('show');
        }
        
        // タイトル画面に戻る
        this._returnToTitle();
    }
    
    /**
     * 全画面を非表示
     * @private
     */
    _hideAllScreens() {
        const screens = [this.neonScreen, this.shopMapScreen];
        screens.forEach(screen => {
            if (screen) {
                screen.classList.remove('active');
            }
        });
    }
    
    /**
     * 現在の状態を取得
     */
    getCurrentPhase() {
        return this.currentPhase;
    }
    
    /**
     * 演出中かどうかを取得
     */
    isTransitionPlaying() {
        return this.isPlaying;
    }
}

// グローバルインスタンス
let neonTransition = null;

// 初期化用関数
function initializeNeonTransition(gameEngine) {
    neonTransition = new NeonTransition(gameEngine);
    neonTransition.initialize();
    return neonTransition;
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.NeonTransition = NeonTransition;
    window.initializeNeonTransition = initializeNeonTransition;
}

console.log('🎬 Neon Transition module loaded');