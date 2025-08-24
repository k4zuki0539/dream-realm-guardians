/**
 * Particle System - パーティクルシステム
 * 視覚エフェクト管理
 */

class ParticleSystem {
    constructor() {
        this.canvas = null;
        this.ctx = null;
        this.particles = [];
        this.animationFrame = null;
        this.lastTime = 0;
        this.isRunning = false;
        
        console.log('✨ Particle System initialized');
    }

    /**
     * パーティクルシステムを初期化
     */
    initialize() {
        this.canvas = document.getElementById('particle-canvas');
        if (!this.canvas) {
            console.warn('⚠️ Particle canvas not found');
            return;
        }
        
        this.ctx = this.canvas.getContext('2d');
        
        // キャンバスサイズを設定
        this._resizeCanvas();
        
        // リサイズ対応
        window.addEventListener('resize', () => this._resizeCanvas());
        
        // アニメーション開始
        this.start();
        
        console.log('✨ Particle System ready');
    }

    /**
     * キャンバスサイズを調整
     * @private
     */
    _resizeCanvas() {
        if (!this.canvas) return;
        
        this.canvas.width = window.innerWidth;
        this.canvas.height = window.innerHeight;
        
        // 高DPI対応
        const dpr = window.devicePixelRatio || 1;
        const rect = this.canvas.getBoundingClientRect();
        
        this.canvas.width = rect.width * dpr;
        this.canvas.height = rect.height * dpr;
        
        this.ctx.scale(dpr, dpr);
        
        this.canvas.style.width = rect.width + 'px';
        this.canvas.style.height = rect.height + 'px';
    }

    /**
     * アニメーション開始
     */
    start() {
        if (this.isRunning) return;
        
        this.isRunning = true;
        this.lastTime = performance.now();
        this._animate();
    }

    /**
     * アニメーション停止
     */
    stop() {
        this.isRunning = false;
        if (this.animationFrame) {
            cancelAnimationFrame(this.animationFrame);
            this.animationFrame = null;
        }
    }

    /**
     * アニメーションループ
     * @private
     */
    _animate(currentTime = performance.now()) {
        if (!this.isRunning) return;
        
        const deltaTime = currentTime - this.lastTime;
        this.lastTime = currentTime;
        
        // キャンバスクリア
        this.ctx.clearRect(0, 0, this.canvas.width, this.canvas.height);
        
        // パーティクル更新と描画
        this._updateParticles(deltaTime);
        this._renderParticles();
        
        // 死んだパーティクルを削除
        this.particles = this.particles.filter(particle => particle.life > 0);
        
        this.animationFrame = requestAnimationFrame((time) => this._animate(time));
    }

    /**
     * パーティクルを更新
     * @private
     */
    _updateParticles(deltaTime) {
        this.particles.forEach(particle => {
            particle.update(deltaTime / 1000); // 秒単位に変換
        });
    }

    /**
     * パーティクルを描画
     * @private
     */
    _renderParticles() {
        this.particles.forEach(particle => {
            particle.render(this.ctx);
        });
    }

    /**
     * パーティクルバースト作成
     */
    createBurst(options = {}) {
        const config = {
            x: window.innerWidth / 2,
            y: window.innerHeight / 2,
            count: 20,
            colors: ['#FFD700', '#FFA500', '#FFFF00'],
            speed: 100,
            life: 2,
            size: 4,
            spread: Math.PI * 2,
            ...options
        };
        
        for (let i = 0; i < config.count; i++) {
            const angle = (config.spread * i / config.count) + (Math.random() - 0.5) * 0.5;
            const speed = config.speed * (0.5 + Math.random() * 0.5);
            const color = config.colors[Math.floor(Math.random() * config.colors.length)];
            
            const particle = new Particle({
                x: config.x,
                y: config.y,
                vx: Math.cos(angle) * speed,
                vy: Math.sin(angle) * speed,
                color: color,
                size: config.size,
                life: config.life,
                decay: 1 / config.life
            });
            
            this.particles.push(particle);
        }
    }

    /**
     * スキルエフェクト作成
     */
    createSkillEffect(skillType, x, y) {
        const effects = {
            hope: {
                colors: ['#FFD700', '#FFFF00', '#FFA500'],
                count: 30,
                speed: 80,
                life: 1.5
            },
            empathy: {
                colors: ['#FF69B4', '#FF1493', '#FFB6C1'],
                count: 25,
                speed: 60,
                life: 2.0
            },
            courage: {
                colors: ['#FF4500', '#FF6347', '#FF7F50'],
                count: 35,
                speed: 120,
                life: 1.2
            },
            despair: {
                colors: ['#9370DB', '#8B00FF', '#4B0082'],
                count: 20,
                speed: 40,
                life: 3.0
            }
        };
        
        const effect = effects[skillType] || effects.hope;
        
        this.createBurst({
            x,
            y,
            ...effect
        });
    }

    /**
     * レベルアップエフェクト
     */
    createLevelUpEffect(x, y) {
        // 外側の爆発
        this.createBurst({
            x,
            y,
            count: 50,
            colors: ['#FFD700', '#FFFF00', '#FFA500'],
            speed: 150,
            life: 2,
            size: 6
        });
        
        // 内側の輝き
        setTimeout(() => {
            this.createBurst({
                x,
                y,
                count: 30,
                colors: ['#FFFFFF', '#FFD700'],
                speed: 50,
                life: 3,
                size: 8
            });
        }, 300);
    }

    /**
     * 星空エフェクト（背景用）
     */
    createStarField(count = 100) {
        for (let i = 0; i < count; i++) {
            const star = new StarParticle({
                x: Math.random() * this.canvas.width,
                y: Math.random() * this.canvas.height,
                size: Math.random() * 2 + 1,
                twinkleSpeed: Math.random() * 2 + 1
            });
            
            this.particles.push(star);
        }
    }

    /**
     * 記憶の欠片エフェクト
     */
    createMemoryFragments(count = 20) {
        for (let i = 0; i < count; i++) {
            const fragment = new MemoryFragment({
                x: Math.random() * this.canvas.width,
                y: this.canvas.height + Math.random() * 200,
                color: ['#87CEEB', '#B0E0E6', '#ADD8E6'][Math.floor(Math.random() * 3)]
            });
            
            this.particles.push(fragment);
        }
    }

    /**
     * ダメージエフェクト
     */
    createDamageEffect(x, y, damage) {
        // ダメージ数値
        const damageText = new DamageText({
            x,
            y,
            text: damage.toString(),
            color: damage > 50 ? '#FF4500' : '#FFFFFF'
        });
        
        this.particles.push(damageText);
        
        // ヒットエフェクト
        this.createBurst({
            x,
            y,
            count: 15,
            colors: ['#FF4500', '#FF6347', '#FFFFFF'],
            speed: 100,
            life: 0.8,
            size: 3
        });
    }

    /**
     * 回復エフェクト
     */
    createHealEffect(x, y, heal) {
        // 回復数値
        const healText = new DamageText({
            x,
            y,
            text: `+${heal}`,
            color: '#32CD32'
        });
        
        this.particles.push(healText);
        
        // 回復エフェクト
        this.createBurst({
            x,
            y,
            count: 20,
            colors: ['#32CD32', '#90EE90', '#FFFFFF'],
            speed: 60,
            life: 1.5,
            size: 4
        });
    }

    /**
     * すべてのパーティクルをクリア
     */
    clearAll() {
        this.particles = [];
    }

    /**
     * パーティクル数を取得
     */
    getParticleCount() {
        return this.particles.length;
    }
}

/**
 * 基本パーティクルクラス
 */
class Particle {
    constructor(options = {}) {
        this.x = options.x || 0;
        this.y = options.y || 0;
        this.vx = options.vx || 0;
        this.vy = options.vy || 0;
        this.color = options.color || '#FFFFFF';
        this.size = options.size || 2;
        this.life = options.life || 1;
        this.maxLife = this.life;
        this.decay = options.decay || 1;
        this.gravity = options.gravity || 50;
        this.alpha = 1;
    }

    update(deltaTime) {
        // 位置更新
        this.x += this.vx * deltaTime;
        this.y += this.vy * deltaTime;
        
        // 重力適用
        this.vy += this.gravity * deltaTime;
        
        // ライフ減少
        this.life -= this.decay * deltaTime;
        this.alpha = this.life / this.maxLife;
    }

    render(ctx) {
        if (this.life <= 0 || this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 星パーティクルクラス
 */
class StarParticle extends Particle {
    constructor(options = {}) {
        super(options);
        this.twinkleSpeed = options.twinkleSpeed || 1;
        this.twinklePhase = Math.random() * Math.PI * 2;
        this.baseAlpha = 0.3 + Math.random() * 0.7;
    }

    update(deltaTime) {
        this.twinklePhase += this.twinkleSpeed * deltaTime;
        this.alpha = this.baseAlpha + Math.sin(this.twinklePhase) * 0.3;
    }

    render(ctx) {
        if (this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = '#FFFFFF';
        ctx.beginPath();
        ctx.arc(this.x, this.y, this.size, 0, Math.PI * 2);
        ctx.fill();
        ctx.restore();
    }
}

/**
 * 記憶の欠片パーティクル
 */
class MemoryFragment extends Particle {
    constructor(options = {}) {
        super({
            ...options,
            vx: (Math.random() - 0.5) * 20,
            vy: -30 - Math.random() * 20,
            life: 10,
            decay: 0.1,
            gravity: -10
        });
        this.rotationSpeed = (Math.random() - 0.5) * 2;
        this.rotation = 0;
    }

    update(deltaTime) {
        super.update(deltaTime);
        this.rotation += this.rotationSpeed * deltaTime;
        
        // 画面外に出たら削除
        if (this.y < -this.size) {
            this.life = 0;
        }
    }

    render(ctx) {
        if (this.life <= 0 || this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha * 0.7;
        ctx.translate(this.x, this.y);
        ctx.rotate(this.rotation);
        ctx.fillStyle = this.color;
        
        // 菱形を描画
        ctx.beginPath();
        ctx.moveTo(0, -this.size);
        ctx.lineTo(this.size, 0);
        ctx.lineTo(0, this.size);
        ctx.lineTo(-this.size, 0);
        ctx.closePath();
        ctx.fill();
        
        ctx.restore();
    }
}

/**
 * ダメージテキストパーティクル
 */
class DamageText extends Particle {
    constructor(options = {}) {
        super({
            ...options,
            vx: (Math.random() - 0.5) * 20,
            vy: -80,
            life: 2,
            decay: 0.5,
            gravity: 0
        });
        this.text = options.text || '';
        this.fontSize = options.fontSize || 24;
        this.fontFamily = options.fontFamily || 'Arial';
    }

    render(ctx) {
        if (this.life <= 0 || this.alpha <= 0) return;
        
        ctx.save();
        ctx.globalAlpha = this.alpha;
        ctx.fillStyle = this.color;
        ctx.strokeStyle = '#000000';
        ctx.lineWidth = 2;
        ctx.font = `bold ${this.fontSize}px ${this.fontFamily}`;
        ctx.textAlign = 'center';
        ctx.textBaseline = 'middle';
        
        ctx.strokeText(this.text, this.x, this.y);
        ctx.fillText(this.text, this.x, this.y);
        
        ctx.restore();
    }
}

// ブラウザ環境でのグローバル露出
if (typeof window !== 'undefined') {
    window.ParticleSystem = ParticleSystem;
    window.Particle = Particle;
    window.StarParticle = StarParticle;
    window.MemoryFragment = MemoryFragment;
    window.DamageText = DamageText;
}

console.log('✨ Particle System module loaded');