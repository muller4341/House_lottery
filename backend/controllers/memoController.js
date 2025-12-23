import { prisma } from '../utils/prismaClient.js';
import { errorHandler } from '../utils/error.js';
import fs from 'fs';
import path from 'path';

// Helper to ensure upload directory exists
const uploadDir = path.join(process.cwd(), 'uploads', 'memos');
if (!fs.existsSync(uploadDir)) {
    fs.mkdirSync(uploadDir, { recursive: true });
}

// Helper to sanitize strings for Postgres/encoding issues
const sanitizeString = (str) => {
    if (!str) return str;

    // Fix Multer/form-data encoding issue only if needed:
    // If the string contains characters that look like mojibake (Latin1 reading UTF-8)
    // AND converting it results in valid Amharic/Unicode.
    try {
        const buf = Buffer.from(str, 'latin1');
        const decoded = buf.toString('utf8');
        // If decoded contains Amharic and original didn't, or it just looks more "correct"
        if (/[\u1200-\u137F]/.test(decoded) && !/[\u1200-\u137F]/.test(str)) {
            str = decoded;
        }
    } catch (e) { }

    // Remove only strictly illegal/control characters. 
    // We allow all Unicode (including Amharic).
    // Specifically avoid removing characters that might be valid in some contexts.
    return str.replace(/[\x00-\x08\x0B\x0C\x0E-\x1F\x7F]/g, "").trim() || 'Untitled Memo';
};

export const createMemo = async (req, res, next) => {
    try {
        let { title } = req.body;
        const userId = req.user.id;
        const file = req.file;

        if (!title || !file) {
            return next(errorHandler(400, 'Title and PDF file are required'));
        }

        if (file.mimetype !== 'application/pdf') {
            // Delete the file if it's not a PDF
            fs.unlinkSync(file.path);
            return next(errorHandler(400, 'Only PDF files are allowed'));
        }

        // Sanitize for DB encoding issues
        title = sanitizeString(title);
        const fileName = sanitizeString(file.originalname);

        const memo = await prisma.memo.create({
            data: {
                title,
                fileName,
                filePath: file.path,
                fileSize: file.size,
                uploadedById: userId,
            },
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                        employeeId: true
                    }
                }
            }
        });

        res.status(201).json(memo);
    } catch (error) {
        console.error('Create memo error:', error);
        next(error);
    }
};

export const getMemos = async (req, res, next) => {
    try {
        const memos = await prisma.memo.findMany({
            orderBy: { createdAt: 'desc' },
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                        employeeId: true
                    }
                }
            }
        });

        res.json(memos);
    } catch (error) {
        console.error('Get memos error:', error);
        next(error);
    }
};

export const deleteMemo = async (req, res, next) => {
    try {
        const { id } = req.params;

        // Check if memo exists
        const memo = await prisma.memo.findUnique({ where: { id } });
        if (!memo) {
            return next(errorHandler(404, 'Memo not found'));
        }

        // Delete file from disk
        const absolutePath = path.resolve(process.cwd(), memo.filePath);
        if (fs.existsSync(absolutePath)) {
            fs.unlinkSync(absolutePath);
        }

        // Delete record from database
        await prisma.memo.delete({ where: { id } });

        res.json({ message: 'Memo deleted successfully' });
    } catch (error) {
        console.error('Delete memo error:', error);
        next(error);
    }
};

export const updateMemo = async (req, res, next) => {
    try {
        const { id } = req.params;
        let { title } = req.body;

        if (!title) {
            return next(errorHandler(400, 'Title is required'));
        }

        title = sanitizeString(title);

        const memo = await prisma.memo.update({
            where: { id },
            data: { title },
            include: {
                uploadedBy: {
                    select: {
                        name: true,
                        employeeId: true
                    }
                }
            }
        });

        res.json(memo);
    } catch (error) {
        console.error('Update memo error:', error);
        next(error);
    }
};

export const downloadMemo = async (req, res, next) => {
    try {
        const { id } = req.params;
        const memo = await prisma.memo.findUnique({ where: { id } });

        if (!memo) {
            return next(errorHandler(404, 'Memo not found'));
        }

        const absolutePath = path.resolve(process.cwd(), memo.filePath);
        if (!fs.existsSync(absolutePath)) {
            return next(errorHandler(404, 'File not found on server'));
        }

        // Set headers for forced download with proper Unicode filename support
        const encodedName = encodeURIComponent(memo.fileName).replace(/'/g, '%27').replace(/\(/g, '%28').replace(/\)/g, '%29');
        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${memo.fileName}"; filename*=UTF-8''${encodedName}`);

        // Use res.sendFile instead of res.download for more control over headers
        res.sendFile(absolutePath);
    } catch (error) {
        console.error('Download memo error:', error);
        next(error);
    }
};
