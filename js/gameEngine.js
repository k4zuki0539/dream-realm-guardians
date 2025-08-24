/**
 * Game Engine Core - 夢境の守護者
 * メインゲームエンジン
 * 
 * 機能:
 * - ゲーム状態管理
 * - シーン管理
 * - プレイヤーデータ管理
 * - 感情値システム
 * - 自動セーブ
 * - CSVデータ統合管理
 */

class GameEngine {
    constructor() {
        this.csvLoader = csvLoader; // グローバルCSVローダー
        this.audioManager = null; // 後で初期化
        this.particleSystem = null; // 後で初期化
        
        // ゲーム状態
        this.gameState = {
            currentScene: 'title',
            previousScene: null,
            gameStarted: false,
            gamePaused: false,
            
            // プレイヤーデータ
            playerData: {
                name: '夢野希',
                level: 1,
                experience: 0,
                experienceToNext: 100,
                
                // ステータス
                maxHp: 100,
                currentHp: 100,
                maxMp: 50,
                currentMp: 50,
                
                // 感情値（エンディング分岐に影響）
                hope: 0,           // 希望
                empathy: 0,        // 共感
                despair: 0,        // 絶望
                loneliness: 0,     // 孤独
                
                // 進行状況
                savedCount: 0,     // 救済した人数
                battlesWon: 0,     // 勝利した戦闘数
                totalBattles: 0,   // 総戦闘数
                
                // 習得スキル
                unlockedSkills: ['mem_childhood'],
                combinedSkills: [],
                
                // アイテム
                items: {
                    hope_fragment: 3,
                    memory_crystal: 1,
                    healing_potion: 2
                }
            },
            
            // 現在の戦闘状態
            battleState: {
                inBattle: false,
                currentEnemy: null,
                turn: 0,
                maxTurns: 10,
                actionPoints: 3,
                playerTurn: true
            },
            
            // ストーリーフラグ
            flags: new Map()
        };
        
        // ゲームデータ
        this.gameData = {
            scenes: new Map(),
            characters: new Map(),
            dialogues: [],
            characterLevels: new Map(),
            endings: new Map(),
            memorySkills: new Map(),
            battleEnemies: new Map(),
            uiElements: new Map(),
            gameBalance: new Map(),
            soundEffects: new Map()
        };
        
        // システム設定
        this.settings = {
            bgmVolume: 0.7,
            seVolume: 0.8,
            voiceVolume: 0.9,
            textSpeed: 50,
            autoSaveInterval: 5000, // 5秒
            screenSize: 'medium'
        };
        
        // 内部状態
        this.initialized = false;
        this.loading = false;
        this.autoSaveTimer = null;
        
        console.log('🎮 Game Engine initialized');
    }

    /**
     * ゲームエンジンを初期化
     */
    async initialize() {
        if (this.initialized) {
            console.log('⚠️ Game Engine already initialized');
            return;
        }

        this.loading = true;
        console.log('🚀 Initializing Dream Realm Guardians...');

        try {
            // ローディング画面表示
            this._showLoadingScreen();

            // 全CSVファイルを並行読み込み
            await this._loadAllGameData();

            // ゲームデータを処理
            this._processGameData();

            // セーブデータをロード（存在する場合）
            this._loadGameFromStorage();

            // オーディオマネージャー初期化
            if (window.audioManager) {
                this.audioManager = window.audioManager;
                await this.audioManager.initialize(this.gameData.soundEffects);
            }

            // パーティクルシステム初期化
            if (window.particleSystem) {
                this.particleSystem = window.particleSystem;
                this.particleSystem.initialize();
            }

            // UI初期化
            this._initializeUI();

            // 自動セーブ開始
            this._startAutoSave();

            // 初期シーンの表示
            await this._transitionToScene(this.gameState.currentScene);

            this.initialized = true;
            this.loading = false;

            // ローディング画面を隠す
            this._hideLoadingScreen();

            console.log('✅ Game Engine initialized successfully');
            
            // 初期化完了イベント
            this._dispatchEvent('gameInitialized', {
                playerData: this.gameState.playerData,
                currentScene: this.gameState.currentScene
            });

        } catch (error) {
            this.loading = false;
            this._hideLoadingScreen();
            console.error('❌ Failed to initialize game engine:', error);
            this._showErrorScreen('ゲームの初期化に失敗しました。', error.message);
            throw error;
        }
    }

    /**
     * 全ゲームデータをロード
     * @private
     */
    async _loadAllGameData() {
        try {
            const csvFiles = await this.csvLoader.getAvailableFiles();
            console.log(`📁 Loading ${csvFiles.length} CSV files...`);

            const startTime = Date.now();
            const gameData = await this.csvLoader.loadMultiple(csvFiles);
            const loadTime = Date.now() - startTime;

            console.log(`⚡ Loaded all CSV files in ${loadTime}ms`);

            // 各データをゲームオブジェクトに保存
            this.rawGameData = gameData;
        } catch (error) {
            console.warn('⚠️ CSV loading had issues:', error.message);
            // 空のデータで続行
            this.rawGameData = {};
        }
    }

    /**
     * ゲームデータを処理してマップに変換
     * @private
     */
    _processGameData() {
        console.log('🔄 Processing game data...');

        // シーンデータの処理
        if (this.rawGameData['scenes.csv']) {
            this.rawGameData['scenes.csv'].forEach(scene => {
                this.gameData.scenes.set(scene.scene_id, {
                    id: scene.scene_id,
                    name: scene.scene_name,
                    background: scene.background_image,
                    bgm: scene.bgm_file,
                    transition: scene.transition_type,
                    duration: parseInt(scene.duration) || 1000
                });
            });
        }

        // キャラクターデータの処理
        if (this.rawGameData['characters.csv']) {
            this.rawGameData['characters.csv'].forEach(char => {
                this.gameData.characters.set(char.char_id, {
                    id: char.char_id,
                    nameJp: char.name_jp,
                    nameEn: char.name_en,
                    age: char.age,
                    personality: char.personality,
                    description: char.description,
                    voiceType: char.voice_type,
                    baseImage: char.base_image
                });
            });
        }

        // 会話データの処理
        if (this.rawGameData['dialogues.csv']) {
            this.gameData.dialogues = this.rawGameData['dialogues.csv'].map(dlg => ({
                id: dlg.dialogue_id,
                sceneId: dlg.scene_id,
                characterId: dlg.character_id,
                text: dlg.text_jp,
                emotion: dlg.emotion,
                voiceFile: dlg.voice_file,
                delay: parseInt(dlg.delay_ms) || 50,
                isChoice: dlg.choice_flag === 'true' || dlg.choice_flag === true
            }));
        }

        // レベル別外見データの処理
        if (this.rawGameData['character_levels.csv']) {
            this.rawGameData['character_levels.csv'].forEach(level => {
                const key = `${level.char_id}_${level.level}`;
                this.gameData.characterLevels.set(key, {
                    charId: level.char_id,
                    level: parseInt(level.level),
                    outfitImage: level.outfit_image,
                    faceExpression: level.face_expression,
                    specialEffects: level.special_effects,
                    unlockCondition: level.unlock_condition
                });
            });
        }

        // エンディングデータの処理
        if (this.rawGameData['endings.csv']) {
            this.rawGameData['endings.csv'].forEach(ending => {
                this.gameData.endings.set(ending.ending_id, {
                    id: ending.ending_id,
                    nameJp: ending.name_jp,
                    nameEn: ending.name_en,
                    hopeMin: parseInt(ending.hope_min),
                    empathyMin: parseInt(ending.empathy_min),
                    despairMax: parseInt(ending.despair_max),
                    lonelinessMax: parseInt(ending.loneliness_max),
                    saveRateMin: parseInt(ending.save_rate_min),
                    priority: parseInt(ending.priority)
                });
            });
        }

        // 記憶スキルデータの処理
        if (this.rawGameData['memory_skills.csv']) {
            this.rawGameData['memory_skills.csv'].forEach(skill => {
                this.gameData.memorySkills.set(skill.skill_id, {
                    id: skill.skill_id,
                    nameJp: skill.name_jp,
                    nameEn: skill.name_en,
                    basePower: parseInt(skill.base_power),
                    emotionType: skill.emotion_type,
                    mpCost: parseInt(skill.mp_cost),
                    description: skill.description,
                    unlockCondition: skill.unlock_condition
                });
            });
        }

        // 敵データの処理
        if (this.rawGameData['battle_enemies.csv']) {
            this.rawGameData['battle_enemies.csv'].forEach(enemy => {
                this.gameData.battleEnemies.set(enemy.enemy_id, {
                    id: enemy.enemy_id,
                    nameJp: enemy.name_jp,
                    maxHp: parseInt(enemy.hp),
                    currentHp: parseInt(enemy.hp),
                    attackPower: parseInt(enemy.attack_power),
                    weaknessEmotion: enemy.weakness_emotion,
                    resistEmotion: enemy.resist_emotion,
                    specialAbility: enemy.special_ability
                });
            });
        }

        // ゲームバランスデータの処理
        if (this.rawGameData['game_balance.csv']) {
            this.rawGameData['game_balance.csv'].forEach(balance => {
                this.gameData.gameBalance.set(balance.balance_id, {
                    id: balance.balance_id,
                    parameterName: balance.parameter_name,
                    baseValue: parseFloat(balance.base_value),
                    levelMultiplier: parseFloat(balance.level_multiplier),
                    maxValue: parseFloat(balance.max_value),
                    description: balance.description
                });
            });
        }

        // 音響効果データの処理
        if (this.rawGameData['sound_effects.csv']) {
            this.rawGameData['sound_effects.csv'].forEach(sound => {
                this.gameData.soundEffects.set(sound.sound_id, {
                    id: sound.sound_id,
                    fileName: sound.file_name,
                    volume: parseFloat(sound.volume),
                    category: sound.category,
                    loop: sound.loop_flag === 'true' || sound.loop_flag === true,
                    fadeInMs: parseInt(sound.fade_in_ms) || 0,
                    fadeOutMs: parseInt(sound.fade_out_ms) || 0
                });
            });
        }

        // ストーリーフラグの初期化
        if (this.rawGameData['story_flags.csv']) {
            this.rawGameData['story_flags.csv'].forEach(flag => {
                const initialValue = flag.initial_value;
                let value;
                
                if (initialValue === 'true') value = true;
                else if (initialValue === 'false') value = false;
                else if (!isNaN(initialValue)) value = parseInt(initialValue);
                else value = initialValue;
                
                this.gameState.flags.set(flag.flag_id, value);
            });
        }

        // UIテキストの初期化
        if (this.rawGameData['ui_texts.csv']) {
            this.gameData.uiTexts = new Map();
            this.rawGameData['ui_texts.csv'].forEach(text => {
                this.gameData.uiTexts.set(text.text_id, {
                    category: text.category,
                    textJp: text.text_jp,
                    textEn: text.text_en,
                    fontSize: parseInt(text.font_size),
                    color: text.color,
                    usageContext: text.usage_context
                });
            });
        }

        console.log('✅ Game data processing completed');
        this._logDataSummary();
    }

    /**
     * データサマリーをログ出力
     * @private
     */
    _logDataSummary() {
        console.log('📊 Game Data Summary:');
        console.log(`  - Scenes: ${this.gameData.scenes.size}`);
        console.log(`  - Characters: ${this.gameData.characters.size}`);
        console.log(`  - Dialogues: ${this.gameData.dialogues.length}`);
        console.log(`  - Endings: ${this.gameData.endings.size}`);
        console.log(`  - Memory Skills: ${this.gameData.memorySkills.size}`);
        console.log(`  - Battle Enemies: ${this.gameData.battleEnemies.size}`);
        console.log(`  - Story Flags: ${this.gameState.flags.size}`);
        console.log(`  - UI Texts: ${this.gameData.uiTexts ? this.gameData.uiTexts.size : 0}`);
    }

    /**
     * シーン遷移
     */
    async transitionToScene(sceneId, transitionType = null) {
        return await this._transitionToScene(sceneId, transitionType);
    }

    /**
     * シーン遷移（内部）
     * @private
     */
    async _transitionToScene(sceneId, transitionType = null) {
        const scene = this.gameData.scenes.get(sceneId);
        if (!scene) {
            console.error(`❌ Scene not found: ${sceneId}`);
            return;
        }

        console.log(`🎬 Transitioning to scene: ${sceneId} (${scene.name})`);

        this.gameState.previousScene = this.gameState.currentScene;
        this.gameState.currentScene = sceneId;

        // 現在のシーンを非アクティブに
        const currentScreen = document.querySelector('.screen.active');
        if (currentScreen) {
            currentScreen.classList.remove('active');
        }

        // BGM変更
        if (this.audioManager && scene.bgm) {
            await this.audioManager.playBGM(scene.bgm);
        }

        // 背景変更
        await this._updateSceneBackground(scene);

        // 新しいシーンをアクティブに
        const newScreen = document.getElementById(`${sceneId}-screen`);
        if (newScreen) {
            setTimeout(() => {
                newScreen.classList.add('active');
            }, scene.duration || 100);
        }

        // シーン遷移完了イベント
        this._dispatchEvent('sceneTransition', {
            fromScene: this.gameState.previousScene,
            toScene: sceneId,
            sceneData: scene
        });
    }

    /**
     * 感情値を更新
     */
    updateEmotion(emotionType, value) {
        if (!(emotionType in this.gameState.playerData)) {
            console.error(`❌ Unknown emotion type: ${emotionType}`);
            return;
        }

        const oldValue = this.gameState.playerData[emotionType];
        this.gameState.playerData[emotionType] = Math.max(0, oldValue + value);
        
        console.log(`💭 Emotion updated: ${emotionType} ${oldValue} → ${this.gameState.playerData[emotionType]} (${value >= 0 ? '+' : ''}${value})`);

        // UI更新
        this._updateEmotionDisplay();

        // 感情値変更イベント
        this._dispatchEvent('emotionChanged', {
            emotionType,
            oldValue,
            newValue: this.gameState.playerData[emotionType],
            change: value
        });
    }

    /**
     * プレイヤーレベルアップ
     */
    levelUp() {
        const oldLevel = this.gameState.playerData.level;
        this.gameState.playerData.level++;
        
        // ステータス上昇
        const hpGain = Math.floor(20 * 1.2 ** (this.gameState.playerData.level - 1));
        const mpGain = Math.floor(10 * 1.1 ** (this.gameState.playerData.level - 1));
        
        this.gameState.playerData.maxHp += hpGain;
        this.gameState.playerData.maxMp += mpGain;
        this.gameState.playerData.currentHp = this.gameState.playerData.maxHp;
        this.gameState.playerData.currentMp = this.gameState.playerData.maxMp;

        // 次のレベルまでの経験値を設定
        this.gameState.playerData.experience = 0;
        this.gameState.playerData.experienceToNext = Math.floor(100 * 1.8 ** (this.gameState.playerData.level - 1));

        console.log(`🌟 Level Up! ${oldLevel} → ${this.gameState.playerData.level}`);
        console.log(`  HP: +${hpGain}, MP: +${mpGain}`);

        // キャラクター外見更新
        this._updateCharacterAppearance();

        // レベルアップイベント
        this._dispatchEvent('levelUp', {
            oldLevel,
            newLevel: this.gameState.playerData.level,
            hpGain,
            mpGain
        });
    }

    /**
     * 経験値を追加
     */
    gainExperience(amount) {
        this.gameState.playerData.experience += amount;
        console.log(`✨ Gained ${amount} EXP`);

        // レベルアップチェック
        while (this.gameState.playerData.experience >= this.gameState.playerData.experienceToNext) {
            this.levelUp();
        }
    }

    /**
     * フラグを設定
     */
    setFlag(flagId, value) {
        const oldValue = this.gameState.flags.get(flagId);
        this.gameState.flags.set(flagId, value);
        
        console.log(`🏳️ Flag updated: ${flagId} = ${value} (was: ${oldValue})`);
        
        this._dispatchEvent('flagChanged', {
            flagId,
            oldValue,
            newValue: value
        });
    }

    /**
     * フラグを取得
     */
    getFlag(flagId) {
        return this.gameState.flags.get(flagId);
    }

    /**
     * UI表示を更新
     * @private
     */
    _updateEmotionDisplay() {
        const emotions = ['hope', 'empathy', 'despair', 'loneliness'];
        emotions.forEach(emotion => {
            const elements = document.querySelectorAll(`#${emotion}-value, #battle-${emotion}`);
            elements.forEach(element => {
                if (element) {
                    element.textContent = this.gameState.playerData[emotion];
                }
            });
        });
    }

    /**
     * キャラクター外見を更新
     * @private
     */
    _updateCharacterAppearance() {
        const level = this.gameState.playerData.level;
        const levelKey = `protag_${level}`;
        const levelData = this.gameData.characterLevels.get(levelKey);
        
        if (levelData) {
            const portraits = document.querySelectorAll('#character-protag, #player-sprite, #title-character');
            portraits.forEach(portrait => {
                if (portrait) {
                    portrait.src = `assets/characters/${levelData.outfitImage}`;
                }
            });
            
            console.log(`👤 Character appearance updated to level ${level}`);
        }
    }

    /**
     * ゲーム状態を保存
     */
    saveGame() {
        try {
            const saveData = {
                gameState: {
                    ...this.gameState,
                    flags: Array.from(this.gameState.flags.entries())
                },
                settings: this.settings,
                timestamp: Date.now(),
                version: '1.0.0'
            };

            localStorage.setItem('dreamGuardiansSave', JSON.stringify(saveData));
            console.log('💾 Game saved successfully');
            
            this._dispatchEvent('gameSaved', { timestamp: saveData.timestamp });
            
        } catch (error) {
            console.error('❌ Failed to save game:', error);
        }
    }

    /**
     * ゲーム状態をロード
     */
    _loadGameFromStorage() {
        try {
            const saveData = localStorage.getItem('dreamGuardiansSave');
            if (!saveData) {
                console.log('ℹ️ No save data found, starting new game');
                return false;
            }

            const parsed = JSON.parse(saveData);
            
            // データの整合性チェック
            if (!parsed.gameState || !parsed.version) {
                console.warn('⚠️ Invalid save data format');
                return false;
            }

            // ゲーム状態の復元
            Object.assign(this.gameState, parsed.gameState);
            
            // フラグの復元（MapオブジェクトをArray.fromで保存してあるため）
            if (Array.isArray(parsed.gameState.flags)) {
                this.gameState.flags = new Map(parsed.gameState.flags);
            }

            // 設定の復元
            if (parsed.settings) {
                Object.assign(this.settings, parsed.settings);
            }

            console.log(`💿 Game loaded from save (${new Date(parsed.timestamp).toLocaleString()})`);
            
            this._dispatchEvent('gameLoaded', { 
                timestamp: parsed.timestamp,
                playerData: this.gameState.playerData 
            });
            
            return true;
            
        } catch (error) {
            console.error('❌ Failed to load save data:', error);
            return false;
        }
    }

    /**
     * 自動セーブ開始
     * @private
     */
    _startAutoSave() {
        if (this.autoSaveTimer) {
            clearInterval(this.autoSaveTimer);
        }
        
        this.autoSaveTimer = setInterval(() => {
            if (!this.gameState.gamePaused) {
                this.saveGame();
            }
        }, this.settings.autoSaveInterval);
        
        console.log(`⏰ Auto-save started (interval: ${this.settings.autoSaveInterval}ms)`);
    }

    /**
     * UIを初期化
     * @private
     */
    _initializeUI() {
        // 感情表示の初期化
        this._updateEmotionDisplay();
        
        // キャラクター外見の初期化
        this._updateCharacterAppearance();
        
        // 基本的なイベントリスナーの設定
        this._setupEventListeners();
    }

    /**
     * イベントリスナー設定
     * @private
     */
    _setupEventListeners() {
        // メニューボタン
        const menuButtons = document.querySelectorAll('.menu-button');
        menuButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const action = e.currentTarget.dataset.action;
                this._handleMenuAction(action);
            });
        });

        // ゲーム内イベント
        document.addEventListener('gameEvent', (e) => {
            this._handleGameEvent(e.detail);
        });
    }

    /**
     * メニューアクション処理
     * @private
     */
    _handleMenuAction(action) {
        switch (action) {
            case 'start_game':
                this._startNewGame();
                break;
            case 'continue_game':
                this._continueGame();
                break;
            case 'open_options':
                this._openOptions();
                break;
            case 'exit_game':
                this._exitGame();
                break;
        }
    }

    /**
     * 新しいゲーム開始
     * @private
     */
    async _startNewGame() {
        console.log('🎮 Starting new game...');
        this.gameState.gameStarted = true;
        await this.transitionToScene('intro_1');
    }

    /**
     * ローディング画面表示/非表示
     * @private
     */
    _showLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            loadingScreen.classList.remove('hidden');
        }
    }

    _hideLoadingScreen() {
        const loadingScreen = document.getElementById('loading-screen');
        if (loadingScreen) {
            setTimeout(() => {
                loadingScreen.classList.add('hidden');
            }, 1000);
        }
    }

    /**
     * エラー画面表示
     * @private
     */
    _showErrorScreen(message, details) {
        const errorHtml = `
            <div class="error-screen">
                <h2>エラーが発生しました</h2>
                <p>${message}</p>
                <details>
                    <summary>詳細情報</summary>
                    <pre>${details}</pre>
                </details>
                <button onclick="location.reload()">再読み込み</button>
            </div>
        `;
        
        document.body.innerHTML = errorHtml;
    }

    /**
     * イベント発行
     * @private
     */
    _dispatchEvent(eventType, data) {
        const event = new CustomEvent('gameEvent', {
            detail: { type: eventType, data }
        });
        document.dispatchEvent(event);
    }

    /**
     * 背景更新
     * @private
     */
    async _updateSceneBackground(scene) {
        if (!scene.background) return;
        
        const backgrounds = document.querySelectorAll('[id$="-bg"]');
        backgrounds.forEach(bg => {
            bg.src = `assets/backgrounds/${scene.background}`;
        });
    }

    /**
     * ゲーム内イベント処理
     * @private
     */
    _handleGameEvent(eventData) {
        try {
            console.log('🎮 Game event received:', eventData);
            
            if (!eventData || !eventData.type) {
                console.warn('⚠️ Invalid game event data');
                return;
            }
            
            switch (eventData.type) {
                case 'dialog_complete':
                    this._onDialogComplete(eventData);
                    break;
                case 'battle_complete':
                    this._onBattleComplete(eventData);
                    break;
                case 'skill_used':
                    this._onSkillUsed(eventData);
                    break;
                case 'emotion_change':
                    this._onEmotionChange(eventData);
                    break;
                default:
                    console.log(`🔄 Unhandled game event: ${eventData.type}`);
            }
        } catch (error) {
            console.error('❌ Error handling game event:', error);
        }
    }

    /**
     * ダイアログ完了イベント処理
     * @private
     */
    _onDialogComplete(eventData) {
        console.log('💬 Dialog complete event processed');
        // 次のシーンに遷移する場合の処理
        if (eventData.nextScene) {
            this.transitionToScene(eventData.nextScene);
        }
    }

    /**
     * バトル完了イベント処理
     * @private
     */
    _onBattleComplete(eventData) {
        console.log('⚔️ Battle complete event processed');
        // バトル結果に応じた処理
        if (eventData.victory) {
            this.updateEmotion('hope', 5);
            this.gameState.playerData.battlesWon++;
        }
        this.gameState.playerData.totalBattles++;
    }

    /**
     * スキル使用イベント処理
     * @private
     */
    _onSkillUsed(eventData) {
        console.log('✨ Skill used event processed');
        // スキル使用に応じた感情値変化
        if (eventData.skillType) {
            this.updateEmotion(eventData.skillType, 2);
        }
    }

    /**
     * 感情変化イベント処理
     * @private
     */
    _onEmotionChange(eventData) {
        console.log('💭 Emotion change event processed');
        // 感情値の変化をUIに反映
        this._updateEmotionDisplay();
    }

    /**
     * 感情値表示更新
     * @private
     */
    _updateEmotionDisplay() {
        try {
            const emotions = ['hope', 'empathy', 'despair', 'loneliness'];
            emotions.forEach(emotion => {
                const element = document.getElementById(`emotion-${emotion}`);
                if (element) {
                    element.textContent = this.gameState.playerData[emotion] || 0;
                }
            });
        } catch (error) {
            console.warn('⚠️ Could not update emotion display:', error.message);
        }
    }
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.GameEngine = GameEngine;
    
    // ゲームエンジンインスタンスを作成する関数
    window.createGameEngine = function(csvLoader = null) {
        if (!window.gameEngine) {
            window.gameEngine = new GameEngine(csvLoader);
        }
        return window.gameEngine;
    };
}

console.log('🎮 Game Engine module loaded');