const Datasheet = require('../models/Datasheet');
const storageService = require('../services/storageService');
const path = require('path');

exports.search = async (req, res) => {
  try {
    const { q, product, category, page = 1, limit = 10 } = req.query;
    const skip = (page - 1) * limit;

    let query = { isPublic: true };

    if (q) {
      query.$text = { $search: q };
    }

    if (product) {
      query.product = { $regex: product, $options: 'i' };
    }

    if (category) {
      query.category = { $regex: category, $options: 'i' };
    }

    const datasheets = await Datasheet.find(query)
      .select('-storagePath -cloudUrl')
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(parseInt(limit));

    const total = await Datasheet.countDocuments(query);

    res.json({
      datasheets,
      pagination: {
        total,
        page: parseInt(page),
        limit: parseInt(limit),
        pages: Math.ceil(total / limit),
      },
    });
  } catch (error) {
    console.error('Search error:', error);
    res.status(500).json({ message: 'Search failed' });
  }
};

exports.getById = async (req, res) => {
  try {
    const { id } = req.params;

    const datasheet = await Datasheet.findById(id).select('-storagePath -cloudUrl');

    if (!datasheet) {
      return res.status(404).json({ message: 'Datasheet not found' });
    }

    res.json(datasheet);
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch datasheet' });
  }
};

exports.download = async (req, res) => {
  try {
    const { id } = req.params;

    const datasheet = await Datasheet.findById(id);

    if (!datasheet) {
      return res.status(404).json({ message: 'Datasheet not found' });
    }

    const fileExists = await storageService.fileExists(datasheet.storagePath);
    if (!fileExists) {
      return res.status(404).json({ message: 'File not found' });
    }

    datasheet.downloadCount += 1;
    await datasheet.save();

    const fileContent = await storageService.getFile(datasheet.storagePath);

    res.setHeader('Content-Type', 'application/octet-stream');
    res.setHeader('Content-Disposition', `attachment; filename="${datasheet.fileName}"`);
    res.send(fileContent);
  } catch (error) {
    console.error('Download error:', error);
    res.status(500).json({ message: 'Download failed' });
  }
};

exports.upload = async (req, res) => {
  try {
    if (!req.file) {
      return res.status(400).json({ message: 'No file provided' });
    }

    const { title, product, category, description, searchTags } = req.body;

    if (!title || !product) {
      return res.status(400).json({ message: 'Title and product are required' });
    }

    const { fileName, storagePath, fileSize, fileId } = await storageService.saveFile(req.file);

    const fileFormat = path.extname(fileName).substring(1).toLowerCase();

    const datasheet = new Datasheet({
      title,
      product,
      category,
      description,
      fileName,
      fileSize,
      fileFormat,
      storagePath,
      searchTags: searchTags ? searchTags.split(',').map(tag => tag.trim()) : [],
      uploadedBy: req.userId,
      isPublic: true,
    });

    await datasheet.save();

    res.status(201).json({
      message: 'Datasheet uploaded successfully',
      datasheet: {
        id: datasheet._id,
        title: datasheet.title,
        product: datasheet.product,
        fileName: datasheet.fileName,
        fileSize: datasheet.fileSize,
      },
    });
  } catch (error) {
    console.error('Upload error:', error);
    res.status(500).json({ message: 'Upload failed' });
  }
};

exports.update = async (req, res) => {
  try {
    const { id } = req.params;
    const { title, product, category, description, searchTags } = req.body;

    const datasheet = await Datasheet.findById(id);

    if (!datasheet) {
      return res.status(404).json({ message: 'Datasheet not found' });
    }

    if (title) datasheet.title = title;
    if (product) datasheet.product = product;
    if (category) datasheet.category = category;
    if (description) datasheet.description = description;
    if (searchTags) datasheet.searchTags = searchTags.split(',').map(tag => tag.trim());

    await datasheet.save();

    res.json({ message: 'Datasheet updated successfully', datasheet });
  } catch (error) {
    console.error('Update error:', error);
    res.status(500).json({ message: 'Update failed' });
  }
};

exports.delete = async (req, res) => {
  try {
    const { id } = req.params;

    const datasheet = await Datasheet.findByIdAndDelete(id);

    if (!datasheet) {
      return res.status(404).json({ message: 'Datasheet not found' });
    }

    await storageService.deleteFile(datasheet.storagePath);

    res.json({ message: 'Datasheet deleted successfully' });
  } catch (error) {
    console.error('Delete error:', error);
    res.status(500).json({ message: 'Delete failed' });
  }
};

exports.getStats = async (req, res) => {
  try {
    const totalDatasheets = await Datasheet.countDocuments();
    const totalDownloads = await Datasheet.aggregate([
      { $group: { _id: null, total: { $sum: '$downloadCount' } } },
    ]);

    const byProduct = await Datasheet.aggregate([
      { $group: { _id: '$product', count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ]);

    res.json({
      totalDatasheets,
      totalDownloads: totalDownloads[0]?.total || 0,
      byProduct,
    });
  } catch (error) {
    res.status(500).json({ message: 'Failed to fetch statistics' });
  }
};
