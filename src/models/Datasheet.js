const mongoose = require('mongoose');

const datasheetSchema = new mongoose.Schema(
  {
    title: {
      type: String,
      required: [true, 'Title is required'],
      trim: true,
      index: true,
    },
    description: {
      type: String,
      trim: true,
    },
    product: {
      type: String,
      required: [true, 'Product name is required'],
      trim: true,
      index: true,
    },
    category: {
      type: String,
      trim: true,
      index: true,
    },
    fileName: {
      type: String,
      required: true,
    },
    fileSize: {
      type: Number,
      required: true,
    },
    fileFormat: {
      type: String,
      enum: ['pdf', 'docx', 'doc', 'xlsx'],
      default: 'pdf',
    },
    storagePath: {
      type: String,
      required: true,
    },
    cloudUrl: String,
    uploadedBy: {
      type: mongoose.Schema.Types.ObjectId,
      ref: 'User',
      required: true,
    },
    downloadCount: {
      type: Number,
      default: 0,
    },
    searchTags: [
      {
        type: String,
        trim: true,
        index: true,
      },
    ],
    isPublic: {
      type: Boolean,
      default: true,
    },
    version: {
      type: String,
      default: '1.0',
    },
  },
  {
    timestamps: true,
  }
);

datasheetSchema.index({ title: 'text', description: 'text', product: 'text', searchTags: 'text' });

module.exports = mongoose.model('Datasheet', datasheetSchema);
