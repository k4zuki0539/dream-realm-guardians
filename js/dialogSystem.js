/**
 * Dialog System - 会話システム
 * 夢境の守護者専用会話システム
 * 
 * 機能:
 * - タイプライター効果
 * - キャラクター感情表現
 * - 立ち絵変化システム
 * - 選択肢システム
 * - 音声再生
 * - 背景変化
 */

class DialogSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.audioManager = null; // 後で初期化
        
        // 現在の会話状態
        this.currentDialog = null;
        this.dialogIndex = 0;
        this.dialogSequence = [];
        this.currentStoryScene = null; // 現在のストーリーシーン
        this.isPlaying = false;
        this.isSkipping = false;
        this.autoPlay = false;
        this.autoPlayDelay = 2000;
        
        // タイプライター設定
        this.typewriterSpeed = 50; // ミリ秒
        this.typewriterTimer = null;
        this.currentText = '';
        this.targetText = '';
        
        // UI要素
        this.dialogScreen = null;
        this.dialogTextElement = null;
        this.characterNPC = null;
        this.characterProtag = null;
        this.npcEmotion = null;
        this.protagEmotion = null;
        this.dialogBackground = null;
        this.nextButton = null;
        this.skipButton = null;
        this.autoButton = null;
        
        // 感情アイコンマップ
        this.emotionIcons = {
            // 基本感情
            normal: '😌',
            happy: '😊',
            sad: '😢',
            angry: '😠',
            surprised: '😲',
            confused: '😕',
            anxious: '😰',
            determined: '😤',
            gentle: '😊',
            resolve: '😠',
            
            // 特殊感情
            hope: '✨',
            despair: '😞',
            empathy: '💝',
            loneliness: '😔',
            fear: '😨',
            courage: '💪',
            love: '💕',
            curiosity: '🤔',
            wisdom: '🧠',
            compassion: '🤗'
        };
        
        console.log('💬 Dialog System initialized');
    }

    /**
     * 会話システムを初期化
     */
    initialize() {
        this._initializeElements();
        this._setupEventListeners();
        
        // オーディオマネージャー取得
        if (window.audioManager) {
            this.audioManager = window.audioManager;
        }
        
        console.log('💬 Dialog System ready');
    }

    /**
     * UI要素を取得
     * @private
     */
    _initializeElements() {
        this.dialogScreen = document.getElementById('dialog-screen');
        this.dialogTextElement = document.getElementById('dialog-text');
        this.characterNPC = document.getElementById('character-npc');
        this.characterProtag = document.getElementById('character-protag');
        this.npcEmotion = document.getElementById('npc-emotion');
        this.protagEmotion = document.getElementById('protag-emotion');
        this.dialogBackground = document.getElementById('dialog-bg');
        this.nextButton = document.getElementById('btn-next-dialog');
        this.skipButton = document.getElementById('btn-skip-dialog');
        this.autoButton = document.getElementById('btn-auto-dialog');
        
        // 要素チェック
        if (!this.dialogScreen || !this.dialogTextElement) {
            console.error('❌ Required dialog elements not found');
        }
    }

    /**
     * イベントリスナー設定
     * @private
     */
    _setupEventListeners() {
        // ダイアログ進行ボタン
        if (this.nextButton) {
            this.nextButton.addEventListener('click', () => {
                this.next();
            });
        }

        // スキップボタン
        if (this.skipButton) {
            this.skipButton.addEventListener('click', () => {
                this.toggleSkip();
            });
        }

        // オートプレイボタン
        if (this.autoButton) {
            this.autoButton.addEventListener('click', () => {
                this.toggleAutoPlay();
            });
        }

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (!this.isPlaying) return;
            
            switch (e.key) {
                case ' ':
                case 'Enter':
                    e.preventDefault();
                    this.next();
                    break;
                case 'Escape':
                    e.preventDefault();
                    this.stop();
                    break;
                case 'Control':
                    this.isSkipping = true;
                    break;
            }
        });

        document.addEventListener('keyup', (e) => {
            if (e.key === 'Control') {
                this.isSkipping = false;
            }
        });

        // クリックで進行
        if (this.dialogTextElement) {
            this.dialogTextElement.addEventListener('click', () => {
                if (this.isPlaying) {
                    this.next();
                }
            });
        }
    }

    /**
     * 会話シーケンス開始
     * @param {string} sceneId - シーンID
     */
    async startDialog(sceneId) {
        console.log(`💬 Starting dialog for scene: ${sceneId}`);
        
        // シーンの会話データを取得
        this.dialogSequence = this._getDialogForScene(sceneId);
        
        if (this.dialogSequence.length === 0) {
            console.warn(`⚠️ No dialog found for scene: ${sceneId}`);
            return;
        }
        
        this.dialogIndex = 0;
        this.isPlaying = true;
        this.currentStoryScene = sceneId; // 現在のストーリーシーンを記録
        
        // 会話画面に遷移
        await this.gameEngine.transitionToScene('dialog');
        
        // 背景設定
        await this._updateBackground(sceneId);
        
        // 最初の会話を開始
        this._showDialog(this.dialogSequence[0]);
    }

    /**
     * シーンの会話データを取得
     * @private
     */
    _getDialogForScene(sceneId) {
        return this.gameEngine.gameData.dialogues.filter(dlg => dlg.sceneId === sceneId);
    }

    /**
     * 会話を表示
     * @private
     */
    async _showDialog(dialog) {
        if (!dialog) {
            console.error('❌ Dialog is null or undefined');
            return;
        }
        
        this.currentDialog = dialog;
        console.log(`💬 Showing dialog: ${dialog.id} - ${dialog.text.substring(0, 50)}...`);
        
        // キャラクター表示更新
        await this._updateCharacterDisplay(dialog);
        
        // テキスト表示開始
        this._startTypewriter(dialog.text, dialog.delay);
        
        // 音声再生
        if (this.audioManager && dialog.voiceFile) {
            this.audioManager.playVoice(dialog.voiceFile);
        }
        
        // 選択肢の場合の処理
        if (dialog.isChoice) {
            this._showChoices(dialog);
        }
    }

    /**
     * キャラクター表示を更新
     * @private
     */
    async _updateCharacterDisplay(dialog) {
        const character = this.gameEngine.gameData.characters.get(dialog.characterId);
        
        if (!character) {
            console.warn(`⚠️ Character not found: ${dialog.characterId}`);
            return;
        }
        
        // 話しているキャラクターの判定
        const isSpeaking = {
            npc: dialog.characterId !== 'protag',
            protag: dialog.characterId === 'protag'
        };
        
        // キャラクタースプライト更新
        if (isSpeaking.npc && this.characterNPC) {
            this.characterNPC.src = `assets/characters/${character.baseImage}`;
            this.characterNPC.classList.add('speaking');
            this.characterProtag?.classList.remove('speaking');
        } else if (isSpeaking.protag && this.characterProtag) {
            // プレイヤーキャラクターはレベルに応じた画像を使用
            const level = this.gameEngine.gameState.playerData.level;
            const levelKey = `protag_${level}`;
            const levelData = this.gameEngine.gameData.characterLevels.get(levelKey);
            
            if (levelData) {
                this.characterProtag.src = `assets/characters/${levelData.outfitImage}`;
            }
            
            this.characterProtag.classList.add('speaking');
            this.characterNPC?.classList.remove('speaking');
        }
        
        // 感情アイコン更新
        this._updateEmotionIcons(dialog);
    }

    /**
     * 感情アイコンを更新
     * @private
     */
    _updateEmotionIcons(dialog) {
        const emotionIcon = this.emotionIcons[dialog.emotion] || this.emotionIcons.normal;
        
        if (dialog.characterId !== 'protag' && this.npcEmotion) {
            this.npcEmotion.textContent = emotionIcon;
        } else if (dialog.characterId === 'protag' && this.protagEmotion) {
            this.protagEmotion.textContent = emotionIcon;
        }
    }

    /**
     * タイプライター効果開始
     * @private
     */
    _startTypewriter(text, delay = 50) {
        this.targetText = text;
        this.currentText = '';
        this.typewriterSpeed = delay;
        
        if (this.dialogTextElement) {
            this.dialogTextElement.textContent = '';
        }
        
        this._continueTypewriter();
    }

    /**
     * タイプライター効果継続
     * @private
     */
    _continueTypewriter() {
        if (this.typewriterTimer) {
            clearTimeout(this.typewriterTimer);
        }
        
        if (this.currentText.length >= this.targetText.length) {
            // タイプライター完了
            this._onTypewriterComplete();
            return;
        }
        
        // 次の文字を追加
        this.currentText += this.targetText[this.currentText.length];
        
        if (this.dialogTextElement) {
            this.dialogTextElement.textContent = this.currentText;
        }
        
        // 速度調整（スキップ時は高速化）
        const speed = this.isSkipping ? 5 : this.typewriterSpeed;
        
        this.typewriterTimer = setTimeout(() => {
            this._continueTypewriter();
        }, speed);
    }

    /**
     * タイプライター完了時の処理
     * @private
     */
    _onTypewriterComplete() {
        if (this.typewriterTimer) {
            clearTimeout(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        
        // オートプレイの場合は自動的に次へ
        if (this.autoPlay) {
            setTimeout(() => {
                this.next();
            }, this.autoPlayDelay);
        }
    }

    /**
     * 次の会話へ進む
     */
    next() {
        // タイプライター中の場合は完了させる
        if (this.typewriterTimer) {
            this._completeTypewriter();
            return;
        }
        
        // 次の会話へ
        this.dialogIndex++;
        
        if (this.dialogIndex >= this.dialogSequence.length) {
            // 会話終了
            this._endDialog();
            return;
        }
        
        // 次の会話を表示
        this._showDialog(this.dialogSequence[this.dialogIndex]);
    }

    /**
     * タイプライターを即座に完了
     * @private
     */
    _completeTypewriter() {
        if (this.typewriterTimer) {
            clearTimeout(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        
        this.currentText = this.targetText;
        if (this.dialogTextElement) {
            this.dialogTextElement.textContent = this.currentText;
        }
        
        this._onTypewriterComplete();
    }

    /**
     * 会話終了
     * @private
     */
    async _endDialog() {
        console.log('💬 Dialog sequence completed');
        
        this.isPlaying = false;
        this.currentDialog = null;
        this.dialogSequence = [];
        
        // 次のシーンに進む（ゲーム進行に応じて）
        await this._determineNextScene();
        
        // ストーリーシーン情報をクリア
        this.currentStoryScene = null;
    }

    /**
     * 次のシーンを決定
     * @private
     */
    async _determineNextScene() {
        const currentStoryScene = this.currentStoryScene;
        
        console.log(`🔄 Determining next scene after: ${currentStoryScene}`);
        
        // シーン進行ロジック
        switch (currentStoryScene) {
            case 'intro_1':
                console.log('🎬 Moving to intro_2 dialog');
                this.startDialog('intro_2');
                break;
            case 'intro_2':
                console.log('⚔️ Moving to battle_1');
                await this.gameEngine.transitionToScene('battle_1');
                break;
            default:
                // デフォルトはタイトル画面に戻る
                console.log('🏠 Returning to title screen');
                await this.gameEngine.transitionToScene('title');
                break;
        }
    }

    /**
     * 選択肢を表示
     * @private
     */
    _showChoices(dialog) {
        // 選択肢実装（簡略化）
        console.log(`🔄 Choice dialog: ${dialog.text}`);
        
        // 実装する場合は、選択肢UIを動的に生成
        // この例では自動で進行
        setTimeout(() => {
            this.next();
        }, 2000);
    }

    /**
     * スキップ切り替え
     */
    toggleSkip() {
        this.isSkipping = !this.isSkipping;
        
        if (this.skipButton) {
            this.skipButton.textContent = this.isSkipping ? 'Skip中' : 'Skip';
        }
        
        console.log(`⏩ Skip mode: ${this.isSkipping}`);
    }

    /**
     * オートプレイ切り替え
     */
    toggleAutoPlay() {
        this.autoPlay = !this.autoPlay;
        
        if (this.autoButton) {
            this.autoButton.textContent = this.autoPlay ? 'Auto中' : 'Auto';
        }
        
        console.log(`🤖 Auto play: ${this.autoPlay}`);
    }

    /**
     * 背景更新
     * @private
     */
    async _updateBackground(sceneId) {
        const scene = this.gameEngine.gameData.scenes.get(sceneId);
        
        if (scene && scene.background && this.dialogBackground) {
            this.dialogBackground.src = `assets/backgrounds/${scene.background}`;
        }
    }

    /**
     * 会話停止
     */
    stop() {
        if (this.typewriterTimer) {
            clearTimeout(this.typewriterTimer);
            this.typewriterTimer = null;
        }
        
        this.isPlaying = false;
        this.currentDialog = null;
        this.dialogSequence = [];
        this.currentStoryScene = null;
        
        console.log('💬 Dialog stopped');
    }

    /**
     * テキスト速度設定
     */
    setTextSpeed(speed) {
        const speedMap = {
            slow: 80,
            normal: 50,
            fast: 20
        };
        
        this.typewriterSpeed = speedMap[speed] || 50;
        console.log(`⚡ Text speed set to: ${speed} (${this.typewriterSpeed}ms)`);
    }

    /**
     * デバッグ用：指定した会話を直接表示
     */
    async showSingleDialog(dialogId) {
        const dialog = this.gameEngine.gameData.dialogues.find(d => d.id === dialogId);
        
        if (dialog) {
            this.isPlaying = true;
            await this.gameEngine.transitionToScene('dialog');
            this._showDialog(dialog);
        } else {
            console.error(`❌ Dialog not found: ${dialogId}`);
        }
    }
}

// タイプライター効果のユーティリティクラス
class TypewriterEffect {
    constructor(element, speed = 50) {
        this.element = element;
        this.speed = speed;
        this.timer = null;
        this.callback = null;
    }

    /**
     * テキストをタイプライター効果で表示
     */
    type(text, callback = null) {
        this.callback = callback;
        this.element.textContent = '';
        
        let index = 0;
        const typeChar = () => {
            if (index < text.length) {
                this.element.textContent += text[index];
                index++;
                this.timer = setTimeout(typeChar, this.speed);
            } else {
                this._complete();
            }
        };
        
        typeChar();
    }

    /**
     * 即座に完了
     */
    complete() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
        this._complete();
    }

    /**
     * 停止
     */
    stop() {
        if (this.timer) {
            clearTimeout(this.timer);
            this.timer = null;
        }
    }

    /**
     * 完了処理
     * @private
     */
    _complete() {
        if (this.callback) {
            this.callback();
        }
    }
}

// グローバルインスタンス
let dialogSystem = null;

// 初期化用関数
function initializeDialogSystem(gameEngine) {
    dialogSystem = new DialogSystem(gameEngine);
    dialogSystem.initialize();
    return dialogSystem;
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.DialogSystem = DialogSystem;
    window.TypewriterEffect = TypewriterEffect;
    window.initializeDialogSystem = initializeDialogSystem;
}

console.log('💬 Dialog System module loaded');