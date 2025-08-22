import { NextRequest, NextResponse } from 'next/server';
import fs from 'fs';
import path from 'path';

interface AdmissionForm {
  id: string;
  title: string;
  description: string;
  fileUrl: string;
  fileName: string;
  fileSize: number;
  uploadDate: string;
  isActive: boolean;
  order: number;
}

const admissionFormsPath = path.join(process.cwd(), 'data', 'admission-forms.json');
const uploadsDir = path.join(process.cwd(), 'public', 'uploads');

// Ensure uploads directory exists
if (!fs.existsSync(uploadsDir)) {
    fs.mkdirSync(uploadsDir, { recursive: true });
}

// Ensure admission forms data file exists
if (!fs.existsSync(admissionFormsPath)) {
    fs.writeFileSync(admissionFormsPath, JSON.stringify([], null, 2));
}

function readAdmissionForms(): AdmissionForm[] {
    try {
        const data = fs.readFileSync(admissionFormsPath, 'utf8');
        return JSON.parse(data);
    } catch (error) {
        return [];
    }
}

function writeAdmissionForms(forms: AdmissionForm[]): void {
    fs.writeFileSync(admissionFormsPath, JSON.stringify(forms, null, 2));
}

export async function GET() {
    try {
        const forms = readAdmissionForms();
        return NextResponse.json(forms);
    } catch (error) {
        return NextResponse.json({ error: 'Failed to fetch admission forms' }, { status: 500 });
    }
}

export async function POST(request: NextRequest) {
    try {
        const formData = await request.formData();
        const title = formData.get('title') as string;
        const description = formData.get('description') as string;
        const file = formData.get('file') as File;

        if (!title || !file) {
            return NextResponse.json({ error: 'Title and file are required' }, { status: 400 });
        }

        // Validate file type
        if (file.type !== 'application/pdf') {
            return NextResponse.json({ error: 'Only PDF files are allowed' }, { status: 400 });
        }

        // Generate unique filename
        const timestamp = Date.now();
        const originalName = file.name.replace(/[^a-zA-Z0-9.-]/g, '_');
        const fileName = `${timestamp}_${originalName}`;
        const filePath = path.join(uploadsDir, fileName);

        // Save file
        const bytes = await file.arrayBuffer();
        const buffer = Buffer.from(bytes);
        fs.writeFileSync(filePath, buffer);

        // Create form record
        const newForm: AdmissionForm = {
            id: `form-${timestamp}`,
            title,
            description: description || '',
            fileUrl: `/uploads/${fileName}`,
            fileName: originalName,
            fileSize: file.size,
            uploadDate: new Date().toISOString(),
            isActive: true,
            order: Date.now()
        };

        // Save to data file
        const forms = readAdmissionForms();
        forms.push(newForm);
        writeAdmissionForms(forms);

        return NextResponse.json(newForm);
    } catch (error) {
        console.error('Error uploading admission form:', error);
        return NextResponse.json({ error: 'Failed to upload admission form' }, { status: 500 });
    }
}
