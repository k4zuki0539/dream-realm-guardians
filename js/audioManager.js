/**
 * Audio Manager - 音響管理システム
 * BGM、効果音、音声の統合管理
 */

class AudioManager {
    constructor() {
        this.bgmPlayer = null;
        this.sePlayer = null;
        this.voicePlayer = null;
        
        this.bgmVolume = 0.7;
        this.seVolume = 0.8;
        this.voiceVolume = 0.9;
        this.masterVolume = 1.0;
        
        this.currentBGM = null;
        this.bgmFadeTimer = null;
        
        // プリロードした音声ファイル
        this.audioCache = new Map();
        this.soundData = new Map();
        
        console.log('🔊 Audio Manager initialized');
    }

    /**
     * 音響システムを初期化
     */
    async initialize(soundEffectsData = null) {
        // HTML audio要素を取得（存在チェック付き）
        this.bgmPlayer = document.getElementById('bgm-player');
        this.sePlayer = document.getElementById('se-player');
        this.voicePlayer = document.getElementById('voice-player');
        
        if (!this.bgmPlayer || !this.sePlayer || !this.voicePlayer) {
            console.warn('⚠️ Audio elements not found, audio functionality may be limited');
        }
        
        // 音響データを設定
        if (soundEffectsData) {
            soundEffectsData.forEach((sound, id) => {
                this.soundData.set(id, sound);
            });
        }
        
        // 音量設定
        this._updateVolumes();
        
        // イベントリスナー設定
        this._setupEventListeners();
        
        console.log('🔊 Audio Manager ready');
    }

    /**
     * イベントリスナー設定
     * @private
     */
    _setupEventListeners() {
        // 音量スライダー
        const volumeSlider = document.getElementById('volume-slider');
        if (volumeSlider) {
            volumeSlider.addEventListener('input', (e) => {
                this.setMasterVolume(e.target.value / 100);
            });
        }

        // BGM終了時の処理
        if (this.bgmPlayer) {
            this.bgmPlayer.addEventListener('ended', () => {
                if (this.bgmPlayer.loop) {
                    this.bgmPlayer.currentTime = 0;
                    this.bgmPlayer.play();
                }
            });
        }
    }

    /**
     * BGMを再生
     */
    async playBGM(bgmId, fadeIn = true) {
        const soundData = this.soundData.get(bgmId);
        if (!soundData) {
            console.warn(`⚠️ BGM not found: ${bgmId}`);
            return;
        }

        const filePath = `assets/audio/bgm/${soundData.fileName}`;
        
        // 同じBGMが既に再生中の場合はスキップ
        if (this.currentBGM === bgmId && this.bgmPlayer && !this.bgmPlayer.paused) {
            return;
        }

        try {
            console.log(`🎵 Playing BGM: ${bgmId}`);
            
            // 現在のBGMをフェードアウト
            if (this.bgmPlayer && !this.bgmPlayer.paused) {
                await this._fadeOutBGM();
            }

            // 新しいBGMを設定
            if (this.bgmPlayer) {
                this.bgmPlayer.src = filePath;
                this.bgmPlayer.loop = soundData.loop;
                this.bgmPlayer.volume = fadeIn ? 0 : this.bgmVolume * this.masterVolume;
                
                await this.bgmPlayer.play();
                this.currentBGM = bgmId;

                // フェードイン
                if (fadeIn) {
                    this._fadeInBGM(soundData.fadeInMs || 1000);
                }
            }
            
        } catch (error) {
            console.error(`❌ Failed to play BGM ${bgmId}:`, error);
        }
    }

    /**
     * BGMをフェードイン
     * @private
     */
    _fadeInBGM(duration = 1000) {
        if (!this.bgmPlayer) return;
        
        const targetVolume = this.bgmVolume * this.masterVolume;
        const startVolume = 0;
        const steps = 60;
        const stepTime = duration / steps;
        const volumeStep = (targetVolume - startVolume) / steps;
        
        let currentStep = 0;
        const fadeTimer = setInterval(() => {
            currentStep++;
            const newVolume = startVolume + (volumeStep * currentStep);
            
            if (this.bgmPlayer) {
                this.bgmPlayer.volume = Math.min(newVolume, targetVolume);
            }
            
            if (currentStep >= steps || newVolume >= targetVolume) {
                clearInterval(fadeTimer);
                if (this.bgmPlayer) {
                    this.bgmPlayer.volume = targetVolume;
                }
            }
        }, stepTime);
    }

    /**
     * BGMをフェードアウト
     * @private
     */
    async _fadeOutBGM(duration = 500) {
        if (!this.bgmPlayer || this.bgmPlayer.paused) return;
        
        return new Promise((resolve) => {
            const startVolume = this.bgmPlayer.volume;
            const steps = 30;
            const stepTime = duration / steps;
            const volumeStep = startVolume / steps;
            
            let currentStep = 0;
            const fadeTimer = setInterval(() => {
                currentStep++;
                const newVolume = startVolume - (volumeStep * currentStep);
                
                if (this.bgmPlayer) {
                    this.bgmPlayer.volume = Math.max(newVolume, 0);
                }
                
                if (currentStep >= steps || newVolume <= 0) {
                    clearInterval(fadeTimer);
                    if (this.bgmPlayer) {
                        this.bgmPlayer.pause();
                        this.bgmPlayer.volume = 0;
                    }
                    resolve();
                }
            }, stepTime);
        });
    }

    /**
     * 効果音を再生
     */
    async playSE(seId) {
        const soundData = this.soundData.get(seId);
        if (!soundData) {
            console.warn(`⚠️ SE not found: ${seId}`);
            return;
        }

        const filePath = `assets/audio/se/${soundData.fileName}`;
        
        try {
            // 複数の効果音を同時再生できるように新しいAudioオブジェクトを作成
            const audio = new Audio(filePath);
            audio.volume = (soundData.volume || this.seVolume) * this.masterVolume;
            
            await audio.play();
            
            // 再生完了後にオブジェクトを解放
            audio.addEventListener('ended', () => {
                audio.remove?.();
            });
            
        } catch (error) {
            console.error(`❌ Failed to play SE ${seId}:`, error);
        }
    }

    /**
     * 音声を再生
     */
    async playVoice(voiceId) {
        const soundData = this.soundData.get(voiceId);
        if (!soundData) {
            console.warn(`⚠️ Voice not found: ${voiceId}`);
            return;
        }

        const filePath = `assets/audio/voice/${soundData.fileName}`;
        
        try {
            if (this.voicePlayer) {
                // 現在の音声を停止
                this.voicePlayer.pause();
                this.voicePlayer.currentTime = 0;
                
                this.voicePlayer.src = filePath;
                this.voicePlayer.volume = (soundData.volume || this.voiceVolume) * this.masterVolume;
                
                await this.voicePlayer.play();
            }
            
        } catch (error) {
            console.error(`❌ Failed to play voice ${voiceId}:`, error);
        }
    }

    /**
     * BGM停止
     */
    stopBGM(fadeOut = true) {
        if (this.bgmPlayer && !this.bgmPlayer.paused) {
            if (fadeOut) {
                this._fadeOutBGM();
            } else {
                this.bgmPlayer.pause();
                this.bgmPlayer.currentTime = 0;
            }
            this.currentBGM = null;
        }
    }

    /**
     * 全音声停止
     */
    stopAll() {
        this.stopBGM(false);
        
        if (this.sePlayer && !this.sePlayer.paused) {
            this.sePlayer.pause();
            this.sePlayer.currentTime = 0;
        }
        
        if (this.voicePlayer && !this.voicePlayer.paused) {
            this.voicePlayer.pause();
            this.voicePlayer.currentTime = 0;
        }
    }

    /**
     * マスター音量設定
     */
    setMasterVolume(volume) {
        this.masterVolume = Math.max(0, Math.min(1, volume));
        this._updateVolumes();
        console.log(`🔊 Master volume: ${Math.round(this.masterVolume * 100)}%`);
    }

    /**
     * BGM音量設定
     */
    setBGMVolume(volume) {
        this.bgmVolume = Math.max(0, Math.min(1, volume));
        this._updateVolumes();
    }

    /**
     * 効果音音量設定
     */
    setSEVolume(volume) {
        this.seVolume = Math.max(0, Math.min(1, volume));
    }

    /**
     * 音声音量設定
     */
    setVoiceVolume(volume) {
        this.voiceVolume = Math.max(0, Math.min(1, volume));
        this._updateVolumes();
    }

    /**
     * 音量を更新
     * @private
     */
    _updateVolumes() {
        if (this.bgmPlayer) {
            this.bgmPlayer.volume = this.bgmVolume * this.masterVolume;
        }
        
        if (this.voicePlayer) {
            this.voicePlayer.volume = this.voiceVolume * this.masterVolume;
        }
    }

    /**
     * BGM一時停止/再開
     */
    toggleBGM() {
        if (this.bgmPlayer) {
            if (this.bgmPlayer.paused) {
                this.bgmPlayer.play();
            } else {
                this.bgmPlayer.pause();
            }
        }
    }

    /**
     * 現在の状態を取得
     */
    getStatus() {
        return {
            currentBGM: this.currentBGM,
            bgmPlaying: this.bgmPlayer ? !this.bgmPlayer.paused : false,
            masterVolume: this.masterVolume,
            bgmVolume: this.bgmVolume,
            seVolume: this.seVolume,
            voiceVolume: this.voiceVolume
        };
    }

    /**
     * 音声ファイルをプリロード
     */
    async preloadAudio(audioIds) {
        console.log(`🔄 Preloading ${audioIds.length} audio files...`);
        
        const promises = audioIds.map(async (audioId) => {
            const soundData = this.soundData.get(audioId);
            if (!soundData) return;
            
            try {
                const audio = new Audio();
                const category = soundData.category || 'se';
                audio.src = `assets/audio/${category}/${soundData.fileName}`;
                
                // プリロード
                await new Promise((resolve, reject) => {
                    audio.addEventListener('loadeddata', resolve);
                    audio.addEventListener('error', reject);
                    audio.load();
                });
                
                this.audioCache.set(audioId, audio);
                
            } catch (error) {
                console.warn(`⚠️ Failed to preload ${audioId}:`, error);
            }
        });
        
        await Promise.all(promises);
        console.log(`✅ Audio preload completed (${this.audioCache.size} files)`);
    }

    /**
     * オーディオキャッシュをクリア
     */
    clearCache() {
        this.audioCache.clear();
        console.log('🗑️ Audio cache cleared');
    }
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.AudioManager = AudioManager;
}

console.log('🔊 Audio Manager module loaded');