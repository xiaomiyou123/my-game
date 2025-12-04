import type { PanoramaScene } from '../data/panoramaScenes';

export class SceneManager {
  private static readonly STORAGE_KEY = 'agri-os-custom-scenes';

  /**
   * 保存场景到本地存储
   */
  static saveScene(scene: PanoramaScene): boolean {
    try {
      const existingScenes = this.loadScenes();
      const updatedScenes = [...existingScenes, scene];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedScenes));
      return true;
    } catch (error) {
      console.error('保存场景失败:', error);
      return false;
    }
  }

  /**
   * 保存多个场景到本地存储
   */
  static saveScenes(scenes: PanoramaScene[]): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenes));
      return true;
    } catch (error) {
      console.error('保存场景列表失败:', error);
      return false;
    }
  }

  /**
   * 从本地存储加载所有自定义场景
   */
  static loadScenes(): PanoramaScene[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const scenes = JSON.parse(stored) as PanoramaScene[];
      return scenes.map(scene => ({
        ...scene,
        // 确保所有必需字段都存在
        hotspots: scene.hotspots || [],
        position: {
          lat: scene.position?.lat || 24.5000,
          lng: scene.position?.lng || 118.0833,
          alt: scene.position?.alt || 0
        },
        metadata: {
          area: scene.metadata?.area || 'custom',
          type: scene.metadata?.type || 'outdoor',
          description: scene.metadata?.description || ''
        }
      }));
    } catch (error) {
      console.error('加载场景失败:', error);
      return [];
    }
  }

  /**
   * 删除指定场景
   */
  static deleteScene(sceneId: string): boolean {
    try {
      const scenes = this.loadScenes();
      const filteredScenes = scenes.filter(scene => scene.id !== sceneId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredScenes));
      return true;
    } catch (error) {
      console.error('删除场景失败:', error);
      return false;
    }
  }

  /**
   * 更新场景
   */
  static updateScene(updatedScene: PanoramaScene): boolean {
    try {
      const scenes = this.loadScenes();
      const index = scenes.findIndex(scene => scene.id === updatedScene.id);
      
      if (index === -1) {
        // 如果场景不存在，添加为新场景
        return this.saveScene(updatedScene);
      }
      
      // 更新现有场景
      scenes[index] = updatedScene;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(scenes));
      return true;
    } catch (error) {
      console.error('更新场景失败:', error);
      return false;
    }
  }

  /**
   * 导出场景为JSON文件
   */
  static exportScene(scene: PanoramaScene): void {
    try {
      const dataStr = JSON.stringify(scene, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${scene.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('导出场景失败:', error);
    }
  }

  /**
   * 导出所有场景为JSON文件
   */
  static exportAllScenes(): void {
    try {
      const scenes = this.loadScenes();
      const dataStr = JSON.stringify(scenes, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `agri_os_scenes_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('导出所有场景失败:', error);
    }
  }

  /**
   * 从JSON文件导入场景
   */
  static async importScenes(file: File): Promise<PanoramaScene[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedScenes = JSON.parse(content) as PanoramaScene[];
          
          // 验证数据格式
          if (!Array.isArray(importedScenes)) {
            reject(new Error('无效的场景文件格式'));
            return;
          }
          
          // 为每个场景生成唯一ID（如果不存在）
          const processedScenes = importedScenes.map((scene, index) => ({
            ...scene,
            id: scene.id || `imported-scene-${Date.now()}-${index}`
          }));
          
          resolve(processedScenes);
        } catch (error) {
          reject(new Error('解析场景文件失败'));
        }
      };
      
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }

  /**
   * 清空所有自定义场景
   */
  static clearAllScenes(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('清空场景失败:', error);
      return false;
    }
  }

  /**
   * 获取场景数量
   */
  static getSceneCount(): number {
    return this.loadScenes().length;
  }
}