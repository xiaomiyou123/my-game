import type { CameraPath, Waypoint } from '../data/panoramaScenes';

export class PathManager {
  private static readonly STORAGE_KEY = 'agri-os-custom-paths';

  /**
   * 保存路径到本地存储
   */
  static savePath(path: CameraPath | { id: string; name: string; waypoints: Waypoint[] }): boolean {
    try {
      const existingPaths = this.loadPaths();
      const updatedPaths = [...existingPaths, path];
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(updatedPaths));
      return true;
    } catch (error) {
      console.error('保存路径失败:', error);
      return false;
    }
  }

  /**
   * 保存多个路径到本地存储
   */
  static savePaths(paths: CameraPath[]): boolean {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(paths));
      return true;
    } catch (error) {
      console.error('保存路径列表失败:', error);
      return false;
    }
  }

  /**
   * 从本地存储加载所有自定义路径
   */
  static loadPaths(): CameraPath[] {
    try {
      const stored = localStorage.getItem(this.STORAGE_KEY);
      if (!stored) return [];
      
      const paths = JSON.parse(stored) as CameraPath[];
      return paths.map(path => ({
        ...path,
        // 确保所有必需字段都存在
        id: path.id || `path-${Date.now()}`,
        name: path.name || '未命名路径',
        waypoints: path.waypoints || [],
        duration: path.duration || 5000,
        easing: path.easing || 'easeInOut',
        isLoop: path.isLoop || false,
        deviceType: path.deviceType || 'manual',
        created: path.created ? new Date(path.created) : new Date()
      }));
    } catch (error) {
      console.error('加载路径失败:', error);
      return [];
    }
  }

  /**
   * 删除指定路径
   */
  static deletePath(pathId: string): boolean {
    try {
      const paths = this.loadPaths();
      const filteredPaths = paths.filter(path => path.id !== pathId);
      
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(filteredPaths));
      return true;
    } catch (error) {
      console.error('删除路径失败:', error);
      return false;
    }
  }

  /**
   * 更新路径
   */
  static updatePath(updatedPath: CameraPath): boolean {
    try {
      const paths = this.loadPaths();
      const index = paths.findIndex(path => path.id === updatedPath.id);
      
      if (index === -1) {
        // 如果路径不存在，添加为新路径
        return this.savePath(updatedPath);
      }
      
      // 更新现有路径
      paths[index] = updatedPath;
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(paths));
      return true;
    } catch (error) {
      console.error('更新路径失败:', error);
      return false;
    }
  }

  /**
   * 导出路径为JSON文件
   */
  static exportPath(path: CameraPath): void {
    try {
      const dataStr = JSON.stringify(path, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `${path.name.replace(/\s+/g, '_')}_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('导出路径失败:', error);
    }
  }

  /**
   * 导出所有路径为JSON文件
   */
  static exportAllPaths(): void {
    try {
      const paths = this.loadPaths();
      const dataStr = JSON.stringify(paths, null, 2);
      const dataUri = 'data:application/json;charset=utf-8,'+ encodeURIComponent(dataStr);
      
      const exportFileDefaultName = `agri_os_paths_${Date.now()}.json`;
      
      const linkElement = document.createElement('a');
      linkElement.setAttribute('href', dataUri);
      linkElement.setAttribute('download', exportFileDefaultName);
      linkElement.click();
    } catch (error) {
      console.error('导出所有路径失败:', error);
    }
  }

  /**
   * 从JSON文件导入单个路径
   */
  static async importPath(file: File): Promise<{ id: string; name: string; waypoints: Waypoint[] } | null> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedPath = JSON.parse(content);
          
          // 验证数据格式
          if (!importedPath || !importedPath.waypoints) {
            reject(new Error('无效的路径文件格式'));
            return;
          }
          
          // 为路径生成唯一ID（如果不存在）
          const processedPath = {
            ...importedPath,
            id: importedPath.id || `imported-path-${Date.now()}`
          };
          
          resolve(processedPath);
        } catch (error) {
          reject(new Error('解析路径文件失败'));
        }
      };
      
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }

  /**
   * 从JSON文件导入路径
   */
  static async importPaths(file: File): Promise<CameraPath[]> {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      
      reader.onload = (e) => {
        try {
          const content = e.target?.result as string;
          const importedPaths = JSON.parse(content) as CameraPath[];
          
          // 验证数据格式
          if (!Array.isArray(importedPaths)) {
            reject(new Error('无效的路径文件格式'));
            return;
          }
          
          // 为每个路径生成唯一ID（如果不存在）
          const processedPaths = importedPaths.map((path, index) => ({
            ...path,
            id: path.id || `imported-path-${Date.now()}-${index}`
          }));
          
          resolve(processedPaths);
        } catch (error) {
          reject(new Error('解析路径文件失败'));
        }
      };
      
      reader.onerror = () => reject(new Error('读取文件失败'));
      reader.readAsText(file);
    });
  }

  /**
   * 清空所有自定义路径
   */
  static clearAllPaths(): boolean {
    try {
      localStorage.removeItem(this.STORAGE_KEY);
      return true;
    } catch (error) {
      console.error('清空路径失败:', error);
      return false;
    }
  }

  /**
   * 获取路径数量
   */
  static getPathCount(): number {
    return this.loadPaths().length;
  }
}