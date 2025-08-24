/**
 * Ending System - エンディング分岐システム
 * 4種類のマルチエンディング管理
 */

class EndingSystem {
    constructor(gameEngine) {
        this.gameEngine = gameEngine;
        this.endingConditions = new Map();
        this.currentEnding = null;
        
        console.log('🎬 Ending System initialized');
    }

    /**
     * エンディングシステムを初期化
     */
    async initialize() {
        // エンディング条件データをロード
        const endingData = this.gameEngine.gameData.endings;
        
        endingData.forEach((ending, id) => {
            this.endingConditions.set(id, ending);
        });
        
        console.log(`🎬 Loaded ${this.endingConditions.size} endings`);
        console.log('🎬 Ending System ready');
    }

    /**
     * エンディングを判定
     */
    determineEnding() {
        const playerData = this.gameEngine.gameState.playerData;
        const totalBattles = playerData.totalBattles || 3;
        const saveRate = totalBattles > 0 ? (playerData.savedCount / totalBattles) * 100 : 0;
        
        console.log('🎯 Determining ending based on player data:');
        console.log(`  - Hope: ${playerData.hope}`);
        console.log(`  - Empathy: ${playerData.empathy}`);
        console.log(`  - Despair: ${playerData.despair}`);
        console.log(`  - Loneliness: ${playerData.loneliness}`);
        console.log(`  - Save Rate: ${saveRate.toFixed(1)}%`);
        console.log(`  - Saved Count: ${playerData.savedCount}/${totalBattles}`);
        
        // 優先度順でエンディング判定
        const sortedEndings = Array.from(this.endingConditions.entries())
            .sort((a, b) => a[1].priority - b[1].priority);
        
        for (const [endingId, conditions] of sortedEndings) {
            if (this._checkEndingCondition(playerData, saveRate, conditions)) {
                console.log(`🎬 Ending determined: ${endingId} (${conditions.nameJp})`);
                return endingId;
            }
        }
        
        // デフォルトエンディング
        console.log('🎬 Using default ending: end_renewal');
        return 'end_renewal';
    }

    /**
     * エンディング条件をチェック
     * @private
     */
    _checkEndingCondition(playerData, saveRate, conditions) {
        const checks = {
            hope: playerData.hope >= conditions.hopeMin,
            empathy: playerData.empathy >= conditions.empathyMin,
            despair: playerData.despair <= conditions.despairMax,
            loneliness: playerData.loneliness <= conditions.lonelinessMax,
            saveRate: saveRate >= conditions.saveRateMin
        };
        
        const result = Object.values(checks).every(check => check);
        
        console.log(`  - Checking ${conditions.nameJp}:`, {
            hope: `${playerData.hope} >= ${conditions.hopeMin} = ${checks.hope}`,
            empathy: `${playerData.empathy} >= ${conditions.empathyMin} = ${checks.empathy}`,
            despair: `${playerData.despair} <= ${conditions.despairMax} = ${checks.despair}`,
            loneliness: `${playerData.loneliness} <= ${conditions.lonelinessMax} = ${checks.loneliness}`,
            saveRate: `${saveRate.toFixed(1)} >= ${conditions.saveRateMin} = ${checks.saveRate}`,
            result
        });
        
        return result;
    }

    /**
     * エンディングを表示
     */
    async displayEnding(endingId) {
        const ending = this.endingConditions.get(endingId);
        if (!ending) {
            console.error(`❌ Ending not found: ${endingId}`);
            return;
        }
        
        this.currentEnding = ending;
        console.log(`🎬 Displaying ending: ${endingId} (${ending.nameJp})`);
        
        // エンディング画面に遷移
        await this.gameEngine.transitionToScene('ending');
        
        // エンディング専用のUI設定
        await this._setupEndingUI(endingId);
        
        // エンディング専用BGMを再生
        await this._playEndingBGM(endingId);
        
        // エンディングテキストを表示
        await this._displayEndingText(endingId);
        
        // 達成率を表示
        this._displayAchievementRate(endingId);
        
        // リプレイオプションを表示
        this._setupReplayOptions();
    }

    /**
     * エンディングUI設定
     * @private
     */
    async _setupEndingUI(endingId) {
        // エンディング背景
        const backgrounds = {
            'end_hope': 'bg_sunrise.png',
            'end_empathy': 'bg_warm_connection.png',
            'end_introspection': 'bg_moonlight.png',
            'end_renewal': 'bg_new_dawn.png'
        };
        
        const background = backgrounds[endingId] || backgrounds['end_hope'];
        const bgElement = document.getElementById('ending-bg');
        if (bgElement) {
            bgElement.src = `assets/backgrounds/${background}`;
        }
        
        // エンディングタイトル
        const titles = {
            'end_hope': '🌅 希望の光エンディング 🌅',
            'end_empathy': '💝 共感の絆エンディング 💝',
            'end_introspection': '🌙 内省の道エンディング 🌙',
            'end_renewal': '✨ 再生の始まりエンディング ✨'
        };
        
        const title = titles[endingId] || titles['end_hope'];
        const titleElement = document.getElementById('ending-title');
        if (titleElement) {
            titleElement.textContent = title;
        }
        
        // キャラクター画像（最終レベル）
        const characterElement = document.getElementById('ending-character');
        if (characterElement) {
            const level = this.gameEngine.gameState.playerData.level;
            const levelKey = `protag_${Math.min(level, 5)}`; // 最大レベル5
            const levelData = this.gameEngine.gameData.characterLevels.get(levelKey);
            
            if (levelData) {
                characterElement.src = `assets/characters/${levelData.outfitImage}`;
            }
        }
    }

    /**
     * エンディングBGM再生
     * @private
     */
    async _playEndingBGM(endingId) {
        const bgmMap = {
            'end_hope': 'bgm_hope_finale',
            'end_empathy': 'bgm_empathy_finale',
            'end_introspection': 'bgm_introspection_finale',
            'end_renewal': 'bgm_renewal_finale'
        };
        
        const bgmId = bgmMap[endingId] || bgmMap['end_hope'];
        
        if (this.gameEngine.audioManager) {
            await this.gameEngine.audioManager.playBGM(bgmId, true);
        }
    }

    /**
     * エンディングテキスト表示
     * @private
     */
    async _displayEndingText(endingId) {
        const messages = {
            'end_hope': [
                '多くの人の心を救い、私も成長することができました。',
                '夢境の守護者として、これからも人々の希望を守り続けます。',
                'あなたの選択が、たくさんの光を生み出しました。'
            ],
            'end_empathy': [
                '一人では解決できないことも、みんなと一緒なら乗り越えられる。',
                '人とのつながりの大切さを学びました。',
                '共感の心が、新しい絆を育んでいきます。'
            ],
            'end_introspection': [
                '自分自身と向き合うことの大切さを学びました。',
                '時には一人で歩む道も、成長への第一歩です。',
                '内なる声に耳を澄ませて、自分だけの答えを見つけました。'
            ],
            'end_renewal': [
                '終わりは新しい始まり。',
                '失敗や挫折も、次への糧となります。',
                'あなたの冒険は、ここから再び始まります。'
            ]
        };
        
        const textMessages = messages[endingId] || messages['end_renewal'];
        const messageElement = document.getElementById('ending-message');
        
        if (messageElement && textMessages.length > 0) {
            // タイプライター効果でテキスト表示
            messageElement.innerHTML = '';
            
            for (let i = 0; i < textMessages.length; i++) {
                await this._typewriterText(messageElement, textMessages[i]);
                if (i < textMessages.length - 1) {
                    messageElement.innerHTML += '<br><br>';
                    await this._delay(1000);
                }
            }
        }
    }

    /**
     * タイプライター効果
     * @private
     */
    async _typewriterText(element, text) {
        return new Promise((resolve) => {
            let index = 0;
            const speed = 50; // ミリ秒
            
            const type = () => {
                if (index < text.length) {
                    element.innerHTML += text[index];
                    index++;
                    setTimeout(type, speed);
                } else {
                    resolve();
                }
            };
            
            type();
        });
    }

    /**
     * 遅延処理
     * @private
     */
    _delay(ms) {
        return new Promise(resolve => setTimeout(resolve, ms));
    }

    /**
     * 達成率表示
     * @private
     */
    _displayAchievementRate(endingId) {
        const playerData = this.gameEngine.gameState.playerData;
        const totalBattles = playerData.totalBattles || 3;
        const saveRate = totalBattles > 0 ? (playerData.savedCount / totalBattles) * 100 : 0;
        
        // 星の数を決定
        let stars = '⭐';
        let description = '';
        
        switch (endingId) {
            case 'end_hope':
                stars = '⭐⭐⭐⭐⭐';
                description = `希望値${playerData.hope}、救済率${saveRate.toFixed(1)}%`;
                break;
            case 'end_empathy':
                stars = '⭐⭐⭐⭐';
                description = `共感値${playerData.empathy}、救済率${saveRate.toFixed(1)}%`;
                break;
            case 'end_introspection':
                stars = '⭐⭐⭐';
                description = `内省的な成長を達成`;
                break;
            case 'end_renewal':
                stars = '⭐⭐';
                description = `新たな始まりへの一歩`;
                break;
        }
        
        const starsElement = document.getElementById('achievement-stars');
        const textElement = document.getElementById('achievement-text');
        
        if (starsElement) {
            starsElement.textContent = stars;
        }
        
        if (textElement) {
            textElement.textContent = `(${description})`;
        }
        
        console.log(`🏆 Achievement: ${stars} - ${description}`);
    }

    /**
     * リプレイオプション設定
     * @private
     */
    _setupReplayOptions() {
        const replayButton = document.getElementById('btn-replay');
        const menuButton = document.getElementById('btn-to-menu');
        
        if (replayButton) {
            replayButton.addEventListener('click', () => {
                this._startNewGame();
            });
        }
        
        if (menuButton) {
            menuButton.addEventListener('click', () => {
                this._returnToMenu();
            });
        }
    }

    /**
     * 新しいゲーム開始
     * @private
     */
    async _startNewGame() {
        console.log('🔄 Starting new game from ending...');
        
        // ゲーム状態をリセット
        this._resetGameState();
        
        // タイトル画面に戻る
        await this.gameEngine.transitionToScene('title');
        
        // 少し待ってから新しいゲームを開始
        setTimeout(() => {
            this.gameEngine._startNewGame();
        }, 1000);
    }

    /**
     * メニューに戻る
     * @private
     */
    async _returnToMenu() {
        console.log('🏠 Returning to menu...');
        
        await this.gameEngine.transitionToScene('title');
    }

    /**
     * ゲーム状態をリセット
     * @private
     */
    _resetGameState() {
        // プレイヤーデータリセット
        Object.assign(this.gameEngine.gameState.playerData, {
            level: 1,
            experience: 0,
            experienceToNext: 100,
            maxHp: 100,
            currentHp: 100,
            maxMp: 50,
            currentMp: 50,
            hope: 0,
            empathy: 0,
            despair: 0,
            loneliness: 0,
            savedCount: 0,
            battlesWon: 0,
            totalBattles: 0,
            unlockedSkills: ['mem_childhood'],
            combinedSkills: [],
            items: {
                hope_fragment: 3,
                memory_crystal: 1,
                healing_potion: 2
            }
        });
        
        // フラグリセット
        this.gameEngine.gameState.flags.clear();
        
        // ストーリーフラグを初期値に戻す
        if (this.gameEngine.rawGameData && this.gameEngine.rawGameData['story_flags.csv']) {
            this.gameEngine.rawGameData['story_flags.csv'].forEach(flag => {
                const initialValue = flag.initial_value;
                let value;
                
                if (initialValue === 'true') value = true;
                else if (initialValue === 'false') value = false;
                else if (!isNaN(initialValue)) value = parseInt(initialValue);
                else value = initialValue;
                
                this.gameEngine.gameState.flags.set(flag.flag_id, value);
            });
        }
        
        console.log('♻️ Game state reset for new playthrough');
    }

    /**
     * エンディング統計表示（デバッグ用）
     */
    showEndingStatistics() {
        const playerData = this.gameEngine.gameState.playerData;
        const totalBattles = playerData.totalBattles || 3;
        const saveRate = totalBattles > 0 ? (playerData.savedCount / totalBattles) * 100 : 0;
        
        console.log('📊 Ending Statistics:');
        console.log('===================');
        console.log(`Final Stats:`);
        console.log(`  - Level: ${playerData.level}`);
        console.log(`  - Hope: ${playerData.hope}`);
        console.log(`  - Empathy: ${playerData.empathy}`);
        console.log(`  - Despair: ${playerData.despair}`);
        console.log(`  - Loneliness: ${playerData.loneliness}`);
        console.log(`  - Saved: ${playerData.savedCount}/${totalBattles} (${saveRate.toFixed(1)}%)`);
        console.log(`  - Battles Won: ${playerData.battlesWon}`);
        
        console.log('\nEnding Eligibility:');
        this.endingConditions.forEach((ending, id) => {
            const eligible = this._checkEndingCondition(playerData, saveRate, ending);
            console.log(`  - ${ending.nameJp}: ${eligible ? '✅' : '❌'}`);
        });
        
        const determinedEnding = this.determineEnding();
        const finalEnding = this.endingConditions.get(determinedEnding);
        console.log(`\nDetermined Ending: ${finalEnding.nameJp} (${determinedEnding})`);
    }

    /**
     * 全エンディング解放チェック（実績システム用）
     */
    checkAllEndingsUnlocked() {
        const seenEndings = JSON.parse(localStorage.getItem('dreamGuardiansSeenEndings') || '[]');
        return seenEndings.length >= this.endingConditions.size;
    }

    /**
     * 見たエンディングを記録
     */
    recordSeenEnding(endingId) {
        let seenEndings = JSON.parse(localStorage.getItem('dreamGuardiansSeenEndings') || '[]');
        
        if (!seenEndings.includes(endingId)) {
            seenEndings.push(endingId);
            localStorage.setItem('dreamGuardiansSeenEndings', JSON.stringify(seenEndings));
            
            console.log(`📝 Recorded seen ending: ${endingId}`);
            console.log(`🏆 Total seen endings: ${seenEndings.length}/${this.endingConditions.size}`);
            
            if (this.checkAllEndingsUnlocked()) {
                console.log('🎉 All endings unlocked!');
            }
        }
    }
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.EndingSystem = EndingSystem;
}

console.log('🎬 Ending System module loaded');