# Cloudinary Image Upload Setup

This project uses Cloudinary for image uploads in the Image to URL portal.

## Setup Instructions

### 1. Get Cloudinary Credentials

1. Go to [Cloudinary Console](https://cloudinary.com/console)
2. Sign up or log in to your account
3. Navigate to your Dashboard
4. You'll find your credentials:
   - **Cloud Name**
   - **API Key**
   - **API Secret**

### 2. Configure Environment Variables

Create a `.env.local` file in the root directory (copy from `.env.example`):

```bash
CLOUDINARY_CLOUD_NAME=your_cloud_name_here
CLOUDINARY_API_KEY=your_api_key_here
CLOUDINARY_API_SECRET=your_api_secret_here
```

Replace the placeholder values with your actual Cloudinary credentials.

### 3. Features

- **Drag & Drop Upload**: Simply drag and drop images to upload
- **File Browser**: Click to browse and select files
- **Image Preview**: Preview images before uploading
- **Auto Stats**: Automatically tracks total uploads, monthly uploads, and storage
- **Copy URL**: Quickly copy uploaded image URLs to clipboard
- **Recent Uploads**: View and manage recently uploaded images
- **Gallery View**: Browse all uploaded images in a grid layout

### 4. Usage

1. Navigate to the "Image to URL" page in the admin panel
2. Drag and drop an image or click "Browse Files"
3. Preview your image and click "Upload to Cloudinary"
4. Copy the generated URL using the "Copy URL" button
5. View all your uploads in the gallery below

### 5. Folder Structure

All uploaded images are stored in the `gdg_uploads` folder in your Cloudinary account for easy organization.

## Security Notes

- Never commit your `.env.local` file to version control
- The `.env.example` file is included for reference only
- Keep your API credentials secure and private
