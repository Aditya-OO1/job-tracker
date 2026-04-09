import { Response } from 'express';
import { Application } from '../models/Application';
import { AuthRequest, KanbanStatus } from '../types';
import { parseJobDescription } from '../services/aiService';

export async function getApplications(req: AuthRequest, res: Response): Promise<void> {
  try {
    const apps = await Application.find({ userId: req.user?.userId }).sort({ status: 1, order: 1, createdAt: -1 });
    res.json(apps);
  } catch {
    res.status(500).json({ message: 'Failed to fetch applications' });
  }
}

export async function createApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const {
      company, role, status, jdLink, notes, dateApplied,
      salaryRange, requiredSkills, niceToHaveSkills, seniority,
      location, resumeSuggestions,
    } = req.body as Partial<{
      company: string; role: string; status: KanbanStatus; jdLink: string;
      notes: string; dateApplied: string; salaryRange: string;
      requiredSkills: string[]; niceToHaveSkills: string[]; seniority: string;
      location: string; resumeSuggestions: Array<{ id: string; text: string }>;
    }>;

    if (!company || !role) {
      res.status(400).json({ message: 'Company and role are required' });
      return;
    }

    const app = await Application.create({
      userId: req.user?.userId,
      company, role, status: status || 'Applied',
      jdLink, notes, dateApplied: dateApplied || new Date(),
      salaryRange, requiredSkills: requiredSkills || [],
      niceToHaveSkills: niceToHaveSkills || [],
      seniority, location, resumeSuggestions: resumeSuggestions || [],
    });

    res.status(201).json(app);
  } catch (err) {
    console.error('Create application error:', err);
    res.status(500).json({ message: 'Failed to create application' });
  }
}

export async function updateApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const app = await Application.findOneAndUpdate(
      { _id: req.params.id, userId: req.user?.userId },
      { $set: req.body },
      { new: true, runValidators: true }
    );

    if (!app) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.json(app);
  } catch {
    res.status(500).json({ message: 'Failed to update application' });
  }
}

export async function deleteApplication(req: AuthRequest, res: Response): Promise<void> {
  try {
    const app = await Application.findOneAndDelete({
      _id: req.params.id,
      userId: req.user?.userId,
    });

    if (!app) {
      res.status(404).json({ message: 'Application not found' });
      return;
    }

    res.json({ message: 'Application deleted' });
  } catch {
    res.status(500).json({ message: 'Failed to delete application' });
  }
}

export async function parseJD(req: AuthRequest, res: Response): Promise<void> {
  try {
    const { jobDescription } = req.body as { jobDescription: string };

    if (!jobDescription || jobDescription.trim().length < 50) {
      res.status(400).json({ message: 'Please provide a job description with at least 50 characters' });
      return;
    }

    const result = await parseJobDescription(jobDescription.trim());
    res.json(result);
  } catch (err) {
    console.error('Parse JD error:', err);
    const message = err instanceof Error ? err.message : 'AI parsing failed';
    res.status(500).json({ message });
  }
}
