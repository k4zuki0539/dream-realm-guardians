#!/usr/bin/env python3
# -*- coding: utf-8 -*-
"""
ゲーム開始演出 - タイトルからマップへの遷移
ネオンの光フェードアウト → 暗転 → 音声 → マップ表示
"""

import pygame
import pygame.mixer
import time
import math

# 初期化
pygame.init()
pygame.mixer.init()

# 画面設定
SCREEN_WIDTH = 1024
SCREEN_HEIGHT = 768
screen = pygame.display.set_mode((SCREEN_WIDTH, SCREEN_HEIGHT))
pygame.display.set_caption("ゲーム開始演出")

# カラー定義
BLACK = (0, 0, 0)
WHITE = (255, 255, 255)
NEON_PINK = (255, 20, 147)
NEON_PURPLE = (138, 43, 226)
NEON_BLUE = (0, 191, 255)

# フォント設定
font_large = pygame.font.Font(None, 48)
font_medium = pygame.font.Font(None, 32)

class GameTransition:
    def __init__(self):
        self.clock = pygame.time.Clock()
        self.running = True
        self.current_phase = "neon_scene"  # neon_scene, fade_out, blackout, audio, map_scene
        self.fade_alpha = 0
        self.fade_speed = 1.2  # フェード速度調整
        self.blackout_timer = 0
        self.audio_played = False
        
        # 音声ファイルの読み込み（存在しない場合はスキップ）
        try:
            self.welcome_sound = pygame.mixer.Sound('welcome.wav')
        except:
            print("音声ファイル 'welcome.wav' が見つかりません。音声なしで続行します。")
            self.welcome_sound = None
    
    def create_neon_gradient(self, surface):
        """ネオンライトのグラデーション背景を作成"""
        for y in range(SCREEN_HEIGHT):
            # 縦方向のグラデーション計算
            ratio = y / SCREEN_HEIGHT
            
            # ピンクから紫、紫から青へのグラデーション
            if ratio < 0.4:
                # ピンク → 紫
                t = ratio / 0.4
                r = int(NEON_PINK[0] * (1-t) + NEON_PURPLE[0] * t)
                g = int(NEON_PINK[1] * (1-t) + NEON_PURPLE[1] * t)
                b = int(NEON_PINK[2] * (1-t) + NEON_PURPLE[2] * t)
            else:
                # 紫 → 青
                t = (ratio - 0.4) / 0.6
                r = int(NEON_PURPLE[0] * (1-t) + NEON_BLUE[0] * t)
                g = int(NEON_PURPLE[1] * (1-t) + NEON_BLUE[1] * t)
                b = int(NEON_PURPLE[2] * (1-t) + NEON_BLUE[2] * t)
            
            pygame.draw.line(surface, (r, g, b), (0, y), (SCREEN_WIDTH, y))
    
    def draw_neon_effects(self, surface, time_offset):
        """ネオンの点滅効果を描画"""
        # 時間に基づく点滅効果
        blink_intensity = (math.sin(time_offset * 3) + 1) / 2  # 0-1の範囲
        
        # ネオンサイン風テキスト（複数レイヤーで光る効果）
        title_text = "裏路地の店"
        
        # 外側の光る効果（ぼかし）
        for offset in range(5, 0, -1):
            alpha = int(100 * blink_intensity * (offset / 5))
            glow_surface = font_large.render(title_text, True, NEON_PINK)
            glow_surface.set_alpha(alpha)
            
            for dx in [-offset, 0, offset]:
                for dy in [-offset, 0, offset]:
                    if dx != 0 or dy != 0:
                        surface.blit(glow_surface, 
                                   (SCREEN_WIDTH//2 - glow_surface.get_width()//2 + dx,
                                    100 + dy))
        
        # メインテキスト
        main_text = font_large.render(title_text, True, WHITE)
        surface.blit(main_text, 
                    (SCREEN_WIDTH//2 - main_text.get_width()//2, 100))
        
        # 装飾的なネオンライン
        for i in range(3):
            line_y = 200 + i * 100
            line_alpha = int(255 * blink_intensity * (0.8 - i * 0.2))
            line_color = (*NEON_BLUE, line_alpha)
            
            # Pygame doesn't support alpha in draw functions, so we use a surface
            line_surface = pygame.Surface((SCREEN_WIDTH, 3), pygame.SRCALPHA)
            line_surface.fill((*NEON_BLUE, line_alpha))
            surface.blit(line_surface, (0, line_y))
    
    def draw_fade_overlay(self, surface, alpha):
        """フェードアウト用の黒いオーバーレイを描画"""
        if alpha > 0:
            fade_surface = pygame.Surface((SCREEN_WIDTH, SCREEN_HEIGHT), pygame.SRCALPHA)
            fade_surface.fill((0, 0, 0, min(alpha, 255)))
            surface.blit(fade_surface, (0, 0))
    
    def draw_simple_map(self, surface):
        """シンプルな店内マップを描画"""
        # 背景
        surface.fill((139, 69, 19))  # 茶色の床
        
        # 壁
        pygame.draw.rect(surface, (101, 67, 33), (50, 50, SCREEN_WIDTH-100, 50))  # 上壁
        pygame.draw.rect(surface, (101, 67, 33), (50, 50, 50, SCREEN_HEIGHT-100))  # 左壁
        pygame.draw.rect(surface, (101, 67, 33), (SCREEN_WIDTH-100, 50, 50, SCREEN_HEIGHT-100))  # 右壁
        pygame.draw.rect(surface, (101, 67, 33), (50, SCREEN_HEIGHT-100, SCREEN_WIDTH-100, 50))  # 下壁
        
        # テーブル（円形）
        pygame.draw.circle(surface, (160, 82, 45), (300, 300), 60)
        pygame.draw.circle(surface, (139, 69, 19), (300, 300), 55)
        
        # カウンター
        pygame.draw.rect(surface, (160, 82, 45), (600, 200, 200, 80))
        pygame.draw.rect(surface, (139, 69, 19), (610, 210, 180, 60))
        
        # 椅子
        for x, y in [(250, 250), (350, 250), (250, 350), (350, 350)]:
            pygame.draw.circle(surface, (101, 67, 33), (x, y), 20)
        
        # 入り口
        pygame.draw.rect(surface, (0, 0, 0), (SCREEN_WIDTH//2 - 40, SCREEN_HEIGHT-100, 80, 50))
        
        # タイトル表示
        map_title = font_medium.render("店内", True, WHITE)
        surface.blit(map_title, (50, 20))
        
        # 説明テキスト
        instruction = font_medium.render("スペースキーで終了", True, WHITE)
        surface.blit(instruction, (50, SCREEN_HEIGHT - 40))
    
    def update(self):
        """状態の更新"""
        current_time = time.time()
        
        if self.current_phase == "neon_scene":
            # ネオンシーン表示（クリックでフェード開始）
            keys = pygame.key.get_pressed()
            if keys[pygame.K_SPACE]:
                self.current_phase = "fade_out"
                print("フェードアウト開始")
        
        elif self.current_phase == "fade_out":
            # フェードアウト処理（3-5秒かけて）
            self.fade_alpha += self.fade_speed
            if self.fade_alpha >= 255:
                self.fade_alpha = 255
                self.current_phase = "blackout"
                self.blackout_timer = current_time
                print("暗転開始")
        
        elif self.current_phase == "blackout":
            # 1-2秒の暗転
            if current_time - self.blackout_timer >= 1.5:
                self.current_phase = "audio"
                if self.welcome_sound and not self.audio_played:
                    self.welcome_sound.play()
                    self.audio_played = True
                    print("音声再生: いらっしゃいませ")
                else:
                    # 音声がない場合は直接マップへ
                    self.current_phase = "map_scene"
                    print("マップシーンへ移行")
        
        elif self.current_phase == "audio":
            # 音声再生後、マップシーンへ移行
            if not pygame.mixer.get_busy():
                self.current_phase = "map_scene"
                print("マップシーンへ移行")
    
    def draw(self):
        """描画処理"""
        current_time = time.time()
        
        if self.current_phase in ["neon_scene", "fade_out"]:
            # ネオンシーンの描画
            self.create_neon_gradient(screen)
            self.draw_neon_effects(screen, current_time)
            
            # 操作説明
            if self.current_phase == "neon_scene":
                instruction = font_medium.render("スペースキーでゲーム開始", True, WHITE)
                screen.blit(instruction, (SCREEN_WIDTH//2 - instruction.get_width()//2, 600))
            
            # フェードアウト効果
            if self.current_phase == "fade_out":
                self.draw_fade_overlay(screen, self.fade_alpha)
        
        elif self.current_phase in ["blackout", "audio"]:
            # 暗転画面
            screen.fill(BLACK)
            if self.current_phase == "audio":
                # 音声再生中のテキスト表示
                audio_text = font_medium.render("いらっしゃいませ...", True, WHITE)
                screen.blit(audio_text, 
                           (SCREEN_WIDTH//2 - audio_text.get_width()//2,
                            SCREEN_HEIGHT//2 - audio_text.get_height()//2))
        
        elif self.current_phase == "map_scene":
            # マップシーンの描画
            self.draw_simple_map(screen)
    
    def run(self):
        """メインループ"""
        print("ゲーム開始演出を開始します")
        print("スペースキーでフェードアウト開始")
        
        while self.running:
            # イベント処理
            for event in pygame.event.get():
                if event.type == pygame.QUIT:
                    self.running = False
                elif event.type == pygame.KEYDOWN:
                    if event.key == pygame.K_ESCAPE:
                        self.running = False
            
            # 更新
            self.update()
            
            # 描画
            self.draw()
            
            # 画面更新
            pygame.display.flip()
            self.clock.tick(60)  # 60 FPS
        
        # 終了処理
        pygame.quit()

if __name__ == "__main__":
    # 演出を実行
    transition = GameTransition()
    transition.run()