/**
 * Battle System - 感情共鳴バトルシステム
 * 夢境の守護者専用バトルシステム
 * 
 * 機能:
 * - 感情共鳴メカニクス
 * - ターン制バトル
 * - ダメージ計算
 * - 感情値変動
 * - バトルログ
 * - AI敵行動
 */

class BattleSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.audioManager = null; // 後で初期化
        this.particleSystem = null; // 後で初期化
        
        // バトル状態
        this.inBattle = false;
        this.currentEnemy = null;
        this.battlePhase = 'player'; // 'player' | 'enemy' | 'victory' | 'defeat'
        this.turnCount = 0;
        this.maxTurns = 10;
        this.actionPoints = 3;
        this.maxActionPoints = 3;
        
        // UI要素
        this.battleScreen = null;
        this.enemySprite = null;
        this.playerSprite = null;
        this.enemyHpFill = null;
        this.playerHpFill = null;
        this.battleLog = null;
        this.skillButtons = [];
        this.emotionButtons = [];
        this.itemButtons = [];
        
        // ダメージ計算設定
        this.damageMultipliers = {
            weakness: 1.5,    // 弱点攻撃
            normal: 1.0,      // 通常
            resist: 0.5       // 耐性
        };
        
        // 感情効果マップ
        this.emotionEffects = {
            hope: { hope: 5, despair: -2 },
            empathy: { empathy: 5, loneliness: -2 },
            courage: { hope: 3, empathy: 2, despair: -1 },
            compassion: { empathy: 4, hope: 2, loneliness: -3 }
        };
        
        console.log('⚔️ Battle System initialized');
    }

    /**
     * バトルシステムを初期化
     */
    initialize() {
        this._initializeElements();
        this._setupEventListeners();
        
        // オーディオマネージャー取得
        if (window.audioManager) {
            this.audioManager = window.audioManager;
        }
        
        // パーティクルシステム取得
        if (window.particleSystem) {
            this.particleSystem = window.particleSystem;
        }
        
        console.log('⚔️ Battle System ready');
    }

    /**
     * UI要素を取得
     * @private
     */
    _initializeElements() {
        this.battleScreen = document.getElementById('battle-screen');
        this.enemySprite = document.getElementById('enemy-sprite');
        this.playerSprite = document.getElementById('player-sprite');
        this.enemyHpFill = document.getElementById('enemy-hp-fill');
        this.playerHpFill = document.getElementById('player-hp-fill');
        this.battleLog = document.getElementById('battle-log-content');
        
        // スキルボタン
        this.skillButtons = Array.from(document.querySelectorAll('.skill-button'));
        this.emotionButtons = Array.from(document.querySelectorAll('.emotion-button'));
        this.itemButtons = Array.from(document.querySelectorAll('.item-button'));
    }

    /**
     * イベントリスナー設定
     * @private
     */
    _setupEventListeners() {
        // スキルボタン
        this.skillButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const skillId = e.currentTarget.dataset.skill;
                this.useMemorySkill(skillId);
            });
        });

        // 感情ボタン
        this.emotionButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const emotion = e.currentTarget.dataset.emotion;
                this.useEmotionResonance(emotion);
            });
        });

        // アイテムボタン
        this.itemButtons.forEach(button => {
            button.addEventListener('click', (e) => {
                const itemId = e.currentTarget.dataset.item;
                this.useItem(itemId);
            });
        });

        // キーボードショートカット
        document.addEventListener('keydown', (e) => {
            if (!this.inBattle || this.battlePhase !== 'player') return;
            
            // 数字キーでスキル使用
            if (e.key >= '1' && e.key <= '9') {
                const index = parseInt(e.key) - 1;
                if (this.skillButtons[index]) {
                    this.skillButtons[index].click();
                }
            }
        });
    }

    /**
     * バトル開始
     * @param {string} enemyId - 敵ID
     */
    async startBattle(enemyId) {
        console.log(`⚔️ Starting battle with: ${enemyId}`);
        
        // 敵データをロード
        this.currentEnemy = this._loadEnemyData(enemyId);
        if (!this.currentEnemy) {
            console.error(`❌ Enemy not found: ${enemyId}`);
            return;
        }
        
        // バトル状態初期化
        this.inBattle = true;
        this.battlePhase = 'player';
        this.turnCount = 1;
        this.actionPoints = this.maxActionPoints;
        
        // ゲーム状態をバトルに設定
        this.gameEngine.gameState.battleState.inBattle = true;
        this.gameEngine.gameState.battleState.currentEnemy = this.currentEnemy;
        
        // バトル画面に遷移
        await this.gameEngine.transitionToScene('battle_1');
        
        // UI初期化
        this._initializeBattleUI();
        
        // バトルBGM再生
        if (this.audioManager) {
            this.audioManager.playBGM('bgm_battle_1');
        }
        
        // バトル開始ログ
        this.addLog('戦闘開始！');
        this.addLog(`${this.currentEnemy.nameJp}が現れた！`);
        
        // 敵の弱点をヒント表示
        this._showEnemyInfo();
        
        console.log('⚔️ Battle started successfully');
    }

    /**
     * 敵データをロード
     * @private
     */
    _loadEnemyData(enemyId) {
        const enemyTemplate = this.gameEngine.gameData.battleEnemies.get(enemyId);
        if (!enemyTemplate) return null;
        
        // 敵データをコピー（元データを変更しないため）
        return {
            ...enemyTemplate,
            currentHp: enemyTemplate.maxHp
        };
    }

    /**
     * バトルUI初期化
     * @private
     */
    _initializeBattleUI() {
        // 敵スプライト設定
        if (this.enemySprite) {
            this.enemySprite.src = `assets/enemies/${this.currentEnemy.id.replace('nightmare_', 'nightmare_')}.png`;
        }
        
        // プレイヤースプライト設定
        if (this.playerSprite) {
            const level = this.gameEngine.gameState.playerData.level;
            const levelKey = `protag_${level}`;
            const levelData = this.gameEngine.gameData.characterLevels.get(levelKey);
            
            if (levelData) {
                this.playerSprite.src = `assets/characters/${levelData.outfitImage}`;
            }
        }
        
        // HP表示更新
        this._updateHPDisplay();
        
        // ターン情報更新
        this._updateTurnDisplay();
        
        // スキルボタン更新
        this._updateSkillButtons();
        
        // 感情値表示更新
        this._updateEmotionDisplay();
    }

    /**
     * 記憶スキル使用
     */
    async useMemorySkill(skillId) {
        if (!this.inBattle || this.battlePhase !== 'player') return;
        
        const skill = this.gameEngine.gameData.memorySkills.get(skillId);
        if (!skill) {
            console.error(`❌ Skill not found: ${skillId}`);
            return;
        }
        
        // MPチェック
        if (this.gameEngine.gameState.playerData.currentMp < skill.mpCost) {
            this.addLog('記憶力が不足している...');
            return;
        }
        
        console.log(`✨ Using memory skill: ${skill.nameJp}`);
        
        // MP消費
        this.gameEngine.gameState.playerData.currentMp -= skill.mpCost;
        
        // ダメージ計算
        const damage = this._calculateSkillDamage(skill);
        
        // 敵にダメージ
        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - damage);
        
        // 感情効果適用
        this._applyEmotionEffect(skill.emotionType);
        
        // エフェクト表示
        this._showSkillEffect(skill);
        
        // ログ追加
        this.addLog(`${skill.nameJp}を使用！`);
        this.addLog(`${this.currentEnemy.nameJp}に${damage}のダメージ！`);
        
        // 相性チェックメッセージ
        this._showCompatibilityMessage(skill);
        
        // UI更新
        this._updateHPDisplay();
        this._updateEmotionDisplay();
        
        // 勝利判定
        if (this.currentEnemy.currentHp <= 0) {
            await this._victory();
            return;
        }
        
        // 行動力消費
        this.actionPoints--;
        if (this.actionPoints <= 0) {
            await this._enemyTurn();
        } else {
            this._updateTurnDisplay();
        }
    }

    /**
     * スキルダメージを計算
     * @private
     */
    _calculateSkillDamage(skill) {
        let baseDamage = skill.basePower;
        
        // レベル補正
        const level = this.gameEngine.gameState.playerData.level;
        baseDamage *= (1 + level * 0.1);
        
        // 感情相性による補正
        let multiplier = this.damageMultipliers.normal;
        
        if (skill.emotionType === this.currentEnemy.weaknessEmotion) {
            multiplier = this.damageMultipliers.weakness;
        } else if (skill.emotionType === this.currentEnemy.resistEmotion) {
            multiplier = this.damageMultipliers.resist;
        }
        
        baseDamage *= multiplier;
        
        // ランダム要素（±10%）
        const randomFactor = 0.9 + Math.random() * 0.2;
        baseDamage *= randomFactor;
        
        return Math.floor(baseDamage);
    }

    /**
     * 感情効果を適用
     * @private
     */
    _applyEmotionEffect(emotionType) {
        const effects = this.emotionEffects[emotionType];
        if (!effects) return;
        
        Object.keys(effects).forEach(emotion => {
            if (emotion in this.gameEngine.gameState.playerData) {
                this.gameEngine.updateEmotion(emotion, effects[emotion]);
            }
        });
    }

    /**
     * 相性メッセージを表示
     * @private
     */
    _showCompatibilityMessage(skill) {
        if (skill.emotionType === this.currentEnemy.weaknessEmotion) {
            this.addLog('効果は抜群だ！');
        } else if (skill.emotionType === this.currentEnemy.resistEmotion) {
            this.addLog('効果はいまひとつ...');
        }
    }

    /**
     * スキルエフェクトを表示
     * @private
     */
    _showSkillEffect(skill) {
        if (this.particleSystem) {
            const colors = {
                hope: ['#FFD700', '#FFA500'],
                empathy: ['#FF69B4', '#FF1493'],
                courage: ['#FF4500', '#FF6347']
            };
            
            this.particleSystem.createBurst({
                x: 400, y: 300,
                count: 20,
                colors: colors[skill.emotionType] || ['#FFFFFF'],
                speed: 2,
                life: 1000
            });
        }
        
        // 敵スプライトにダメージアニメーション
        if (this.enemySprite) {
            this.enemySprite.classList.add('damaged');
            setTimeout(() => {
                this.enemySprite.classList.remove('damaged');
            }, 500);
        }
    }

    /**
     * 感情共鳴使用
     */
    async useEmotionResonance(emotion) {
        if (!this.inBattle || this.battlePhase !== 'player') return;
        
        console.log(`💝 Using emotion resonance: ${emotion}`);
        
        // 特殊感情効果
        const resonanceEffects = {
            hope: { damage: 30, emotionGain: { hope: 8, despair: -5 } },
            empathy: { damage: 25, emotionGain: { empathy: 8, loneliness: -5 } }
        };
        
        const effect = resonanceEffects[emotion];
        if (!effect) return;
        
        // ダメージ適用
        this.currentEnemy.currentHp = Math.max(0, this.currentEnemy.currentHp - effect.damage);
        
        // 感情値変化
        Object.keys(effect.emotionGain).forEach(emotionType => {
            this.gameEngine.updateEmotion(emotionType, effect.emotionGain[emotionType]);
        });
        
        // ログ追加
        this.addLog(`${emotion}の力で共鳴した！`);
        this.addLog(`${this.currentEnemy.nameJp}に${effect.damage}のダメージ！`);
        
        // UI更新
        this._updateHPDisplay();
        this._updateEmotionDisplay();
        
        // 勝利判定
        if (this.currentEnemy.currentHp <= 0) {
            await this._victory();
            return;
        }
        
        // 次のターンへ
        this.actionPoints--;
        if (this.actionPoints <= 0) {
            await this._enemyTurn();
        } else {
            this._updateTurnDisplay();
        }
    }

    /**
     * アイテム使用
     */
    async useItem(itemId) {
        if (!this.inBattle || this.battlePhase !== 'player') return;
        
        const playerData = this.gameEngine.gameState.playerData;
        
        if (!playerData.items[itemId] || playerData.items[itemId] <= 0) {
            this.addLog('アイテムを持っていない...');
            return;
        }
        
        console.log(`🧪 Using item: ${itemId}`);
        
        // アイテム効果
        const itemEffects = {
            hope_fragment: { hp: 30, emotionGain: { hope: 5 } },
            memory_crystal: { mp: 25, emotionGain: { empathy: 3 } },
            healing_potion: { hp: 50 }
        };
        
        const effect = itemEffects[itemId];
        if (!effect) return;
        
        // アイテム消費
        playerData.items[itemId]--;
        
        // 効果適用
        if (effect.hp) {
            const healAmount = Math.min(effect.hp, playerData.maxHp - playerData.currentHp);
            playerData.currentHp += healAmount;
            this.addLog(`${healAmount}回復した！`);
        }
        
        if (effect.mp) {
            const mpAmount = Math.min(effect.mp, playerData.maxMp - playerData.currentMp);
            playerData.currentMp += mpAmount;
            this.addLog(`記憶力が${mpAmount}回復した！`);
        }
        
        if (effect.emotionGain) {
            Object.keys(effect.emotionGain).forEach(emotion => {
                this.gameEngine.updateEmotion(emotion, effect.emotionGain[emotion]);
            });
        }
        
        // UI更新
        this._updateHPDisplay();
        this._updateEmotionDisplay();
        
        // 次のターンへ
        this.actionPoints--;
        if (this.actionPoints <= 0) {
            await this._enemyTurn();
        } else {
            this._updateTurnDisplay();
        }
    }

    /**
     * 敵のターン
     * @private
     */
    async _enemyTurn() {
        this.battlePhase = 'enemy';
        this.addLog('--- 敵のターン ---');
        
        // AIによる行動決定
        const action = this._determineEnemyAction();
        
        await this._executeEnemyAction(action);
        
        // ターン終了処理
        this.turnCount++;
        this.actionPoints = this.maxActionPoints;
        this.battlePhase = 'player';
        
        // 最大ターン数チェック
        if (this.turnCount > this.maxTurns) {
            await this._timeUp();
            return;
        }
        
        this._updateTurnDisplay();
        this.addLog('--- あなたのターン ---');
    }

    /**
     * 敵の行動を決定
     * @private
     */
    _determineEnemyAction() {
        const playerData = this.gameEngine.gameState.playerData;
        const enemyHpRatio = this.currentEnemy.currentHp / this.currentEnemy.maxHp;
        
        // HP低下時は特殊攻撃を使いやすくする
        if (enemyHpRatio < 0.3 && Math.random() < 0.7) {
            return { type: 'special', ability: this.currentEnemy.specialAbility };
        } else if (playerData.currentHp > playerData.maxHp * 0.8 && Math.random() < 0.5) {
            return { type: 'attack', power: this.currentEnemy.attackPower * 1.2 };
        } else {
            return { type: 'attack', power: this.currentEnemy.attackPower };
        }
    }

    /**
     * 敵の行動を実行
     * @private
     */
    async _executeEnemyAction(action) {
        const playerData = this.gameEngine.gameState.playerData;
        
        switch (action.type) {
            case 'attack':
                const damage = Math.floor(action.power * (0.8 + Math.random() * 0.4));
                playerData.currentHp = Math.max(0, playerData.currentHp - damage);
                
                this.addLog(`${this.currentEnemy.nameJp}の攻撃！`);
                this.addLog(`${damage}のダメージを受けた！`);
                
                // プレイヤースプライトにダメージアニメーション
                if (this.playerSprite) {
                    this.playerSprite.classList.add('shake');
                    setTimeout(() => {
                        this.playerSprite.classList.remove('shake');
                    }, 500);
                }
                break;
                
            case 'special':
                this._executeSpecialAbility(action.ability);
                break;
        }
        
        this._updateHPDisplay();
        
        // 敗北判定
        if (playerData.currentHp <= 0) {
            await this._defeat();
        }
    }

    /**
     * 特殊能力を実行
     * @private
     */
    _executeSpecialAbility(ability) {
        const playerData = this.gameEngine.gameState.playerData;
        
        switch (ability) {
            case '絶望の波動':
                this.gameEngine.updateEmotion('despair', 10);
                this.gameEngine.updateEmotion('hope', -5);
                this.addLog(`${this.currentEnemy.nameJp}の絶望の波動！`);
                this.addLog('心が重い絶望に包まれた...');
                break;
                
            case '炎の怒り':
                const fireDamage = Math.floor(this.currentEnemy.attackPower * 1.5);
                playerData.currentHp = Math.max(0, playerData.currentHp - fireDamage);
                this.addLog(`${this.currentEnemy.nameJp}の炎の怒り！`);
                this.addLog(`${fireDamage}のダメージ！`);
                break;
                
            case '恐怖の幻影':
                this.gameEngine.updateEmotion('loneliness', 8);
                this.addLog(`${this.currentEnemy.nameJp}の恐怖の幻影！`);
                this.addLog('恐ろしい幻が心を支配する...');
                break;
                
            default:
                this.addLog(`${this.currentEnemy.nameJp}の${ability}！`);
                break;
        }
    }

    /**
     * 勝利処理
     * @private
     */
    async _victory() {
        this.battlePhase = 'victory';
        
        console.log('🎉 Battle victory!');
        
        this.addLog('--- 勝利！ ---');
        this.addLog(`${this.currentEnemy.nameJp}を救済した！`);
        
        // 勝利報酬
        const expGain = 50 + this.currentEnemy.maxHp / 4;
        this.gameEngine.gainExperience(expGain);
        
        // 救済カウント増加
        this.gameEngine.gameState.playerData.savedCount++;
        this.gameEngine.gameState.playerData.battlesWon++;
        
        // 感情値上昇（勝利ボーナス）
        this.gameEngine.updateEmotion('hope', 15);
        this.gameEngine.updateEmotion('empathy', 10);
        
        // サウンドエフェクト
        if (this.audioManager) {
            this.audioManager.playSE('se_victory');
        }
        
        // バトル終了
        setTimeout(() => {
            this._endBattle();
        }, 3000);
    }

    /**
     * 敗北処理
     * @private
     */
    async _defeat() {
        this.battlePhase = 'defeat';
        
        console.log('😵 Battle defeat...');
        
        this.addLog('--- 敗北... ---');
        this.addLog('力及ばなかった...');
        
        // 感情値変化（敗北ペナルティ）
        this.gameEngine.updateEmotion('despair', 10);
        this.gameEngine.updateEmotion('loneliness', 5);
        this.gameEngine.updateEmotion('hope', -5);
        
        // サウンドエフェクト
        if (this.audioManager) {
            this.audioManager.playSE('se_defeat');
        }
        
        // バトル終了
        setTimeout(() => {
            this._endBattle();
        }, 3000);
    }

    /**
     * 時間切れ処理
     * @private
     */
    async _timeUp() {
        this.battlePhase = 'timeout';
        
        this.addLog('--- 時間切れ ---');
        this.addLog('決着がつかなかった...');
        
        // 部分的な報酬
        const expGain = 20;
        this.gameEngine.gainExperience(expGain);
        
        setTimeout(() => {
            this._endBattle();
        }, 2000);
    }

    /**
     * バトル終了
     * @private
     */
    async _endBattle() {
        this.inBattle = false;
        this.currentEnemy = null;
        this.battlePhase = 'player';
        
        // ゲーム状態更新
        this.gameEngine.gameState.battleState.inBattle = false;
        this.gameEngine.gameState.battleState.currentEnemy = null;
        this.gameEngine.gameState.playerData.totalBattles++;
        
        // 次のシーンへ進む
        await this._determinePostBattleScene();
        
        console.log('⚔️ Battle ended');
    }

    /**
     * バトル後のシーンを決定
     * @private
     */
    async _determinePostBattleScene() {
        const savedCount = this.gameEngine.gameState.playerData.savedCount;
        const totalBattles = this.gameEngine.gameState.playerData.totalBattles;
        
        // プログレッション判定
        if (totalBattles >= 3) {
            // 最終戦完了後はエンディング判定
            await this._checkEnding();
        } else if (totalBattles === 2) {
            // 2戦目後は最終戦へ
            await this.gameEngine.transitionToScene('battle_3');
        } else {
            // 1戦目後は2戦目へ
            await this.gameEngine.transitionToScene('battle_2');
        }
    }

    /**
     * エンディング判定
     * @private
     */
    async _checkEnding() {
        if (window.endingSystem) {
            const endingId = window.endingSystem.determineEnding();
            await window.endingSystem.displayEnding(endingId);
        } else {
            // フォールバック
            await this.gameEngine.transitionToScene('ending_hope');
        }
    }

    /**
     * HP表示を更新
     * @private
     */
    _updateHPDisplay() {
        // 敵HP
        if (this.enemyHpFill && this.currentEnemy) {
            const hpPercent = (this.currentEnemy.currentHp / this.currentEnemy.maxHp) * 100;
            this.enemyHpFill.style.width = `${hpPercent}%`;
            
            document.getElementById('enemy-hp').textContent = this.currentEnemy.currentHp;
            document.getElementById('enemy-max-hp').textContent = this.currentEnemy.maxHp;
        }
        
        // プレイヤーHP
        if (this.playerHpFill) {
            const playerData = this.gameEngine.gameState.playerData;
            const hpPercent = (playerData.currentHp / playerData.maxHp) * 100;
            this.playerHpFill.style.width = `${hpPercent}%`;
            
            document.getElementById('player-hp').textContent = playerData.currentHp;
            document.getElementById('player-max-hp').textContent = playerData.maxHp;
        }
    }

    /**
     * ターン表示を更新
     * @private
     */
    _updateTurnDisplay() {
        const turnElement = document.getElementById('current-turn');
        if (turnElement) {
            turnElement.textContent = this.turnCount;
        }
        
        const actionPointsElement = document.getElementById('action-points');
        if (actionPointsElement) {
            actionPointsElement.textContent = '●'.repeat(this.actionPoints) + '○'.repeat(this.maxActionPoints - this.actionPoints);
        }
        
        const memoryPowerElement = document.getElementById('memory-power');
        if (memoryPowerElement) {
            memoryPowerElement.textContent = this.gameEngine.gameState.playerData.currentMp;
        }
    }

    /**
     * スキルボタンを更新
     * @private
     */
    _updateSkillButtons() {
        const playerData = this.gameEngine.gameState.playerData;
        
        this.skillButtons.forEach(button => {
            const skillId = button.dataset.skill;
            const skill = this.gameEngine.gameData.memorySkills.get(skillId);
            
            if (skill) {
                // MP不足チェック
                const canUse = playerData.currentMp >= skill.mpCost && this.battlePhase === 'player';
                button.disabled = !canUse;
                
                if (!canUse) {
                    button.classList.add('disabled');
                } else {
                    button.classList.remove('disabled');
                }
            }
        });
    }

    /**
     * 感情表示を更新
     * @private
     */
    _updateEmotionDisplay() {
        const playerData = this.gameEngine.gameState.playerData;
        const emotions = ['hope', 'empathy', 'despair', 'loneliness'];
        
        emotions.forEach(emotion => {
            const element = document.getElementById(`battle-${emotion}`);
            if (element) {
                element.textContent = playerData[emotion];
            }
        });
    }

    /**
     * 敵情報を表示
     * @private
     */
    _showEnemyInfo() {
        if (this.currentEnemy) {
            const nameElement = document.querySelector('.enemy-name');
            if (nameElement) {
                nameElement.textContent = this.currentEnemy.nameJp;
            }
            
            const emotionElement = document.getElementById('enemy-emotion-state');
            if (emotionElement) {
                const emotionMap = {
                    despair: '絶望MAX',
                    anger: '怒りMAX',
                    fear: '恐怖MAX',
                    loneliness: '孤独MAX'
                };
                emotionElement.textContent = emotionMap[this.currentEnemy.resistEmotion] || '不明';
            }
            
            const weaknessElement = document.getElementById('enemy-weakness');
            if (weaknessElement) {
                const weaknessMap = {
                    hope: '希望',
                    empathy: '共感',
                    courage: '勇気',
                    compassion: '慈愛'
                };
                weaknessElement.textContent = weaknessMap[this.currentEnemy.weaknessEmotion] || '不明';
            }
        }
    }

    /**
     * バトルログに追加
     */
    addLog(message) {
        if (!this.battleLog) return;
        
        const logEntry = document.createElement('div');
        logEntry.className = 'log-entry';
        logEntry.textContent = message;
        
        this.battleLog.appendChild(logEntry);
        this.battleLog.scrollTop = this.battleLog.scrollHeight;
        
        console.log(`📝 Battle Log: ${message}`);
    }

    /**
     * バトル強制終了
     */
    forceEndBattle() {
        if (this.inBattle) {
            this.addLog('バトルを強制終了します...');
            this._endBattle();
        }
    }
}

// グローバルインスタンス
let battleSystem = null;

// 初期化用関数
function initializeBattleSystem(gameEngine) {
    battleSystem = new BattleSystem(gameEngine);
    battleSystem.initialize();
    return battleSystem;
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.BattleSystem = BattleSystem;
    window.initializeBattleSystem = initializeBattleSystem;
}

console.log('⚔️ Battle System module loaded');