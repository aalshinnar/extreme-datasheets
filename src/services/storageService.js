const fs = require('fs').promises;
const path = require('path');
const { v4: uuidv4 } = require('uuid');

class StorageService {
  constructor() {
    this.uploadDir = path.join(__dirname, '../../uploads');
    this.ensureUploadDir();
  }

  async ensureUploadDir() {
    try {
      await fs.access(this.uploadDir);
    } catch {
      await fs.mkdir(this.uploadDir, { recursive: true });
    }
  }

  async saveFile(file) {
    try {
      await this.ensureUploadDir();
      const fileId = uuidv4();
      const fileExt = path.extname(file.originalname);
      const fileName = `${fileId}${fileExt}`;
      const filePath = path.join(this.uploadDir, fileName);

      await fs.writeFile(filePath, file.buffer);

      return {
        fileName: file.originalname,
        storagePath: filePath,
        fileSize: file.size,
        fileId: fileName,
      };
    } catch (error) {
      throw new Error(`Failed to save file: ${error.message}`);
    }
  }

  async getFile(filePath) {
    try {
      return await fs.readFile(filePath);
    } catch (error) {
      throw new Error(`Failed to read file: ${error.message}`);
    }
  }

  async deleteFile(filePath) {
    try {
      await fs.unlink(filePath);
      return true;
    } catch (error) {
      console.error('Error deleting file:', error);
      return false;
    }
  }

  async fileExists(filePath) {
    try {
      await fs.access(filePath);
      return true;
    } catch {
      return false;
    }
  }
}

module.exports = new StorageService();
