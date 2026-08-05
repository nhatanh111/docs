import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectModel } from '@nestjs/sequelize';
import { ApiDocument } from './document.entity';
import { ApiEndpoint } from './endpoint.entity';

export interface Endpoint {
  endpointId: string;
  method: string;
  path: string;
  name: string;
  allowedPartners: string[];
  requestSample?: any;
  responseFormat?: any;
  description?: string;
  fields?: any[];
}

export interface Document {
  id: string;
  title: string;
  endpoints: Endpoint[];
}

export interface Project {
  projectId: string;
  projectName: string;
  allowedPartners: string[];
  documents: Document[];
}

@Injectable()
export class DocumentsService {
  constructor(
    @InjectModel(ApiDocument) private docModel: typeof ApiDocument,
    @InjectModel(ApiEndpoint) private endpointModel: typeof ApiEndpoint,
  ) {}

  async getDocuments(user?: {
    role?: string;
    partnerId?: string;
  }): Promise<Project[]> {
    const [docs, endpoints] = await Promise.all([
      this.docModel.findAll({ order: [['projectId', 'ASC']] }),
      this.endpointModel.findAll(),
    ]);

    const endpointsByDoc = new Map<string, Endpoint[]>();
    endpoints.forEach((ep) => {
      const list = endpointsByDoc.get(ep.documentId) || [];
      list.push({
        endpointId: ep.endpointId,
        method: ep.method,
        path: ep.path,
        name: ep.name,
        allowedPartners: (ep as any).allowedPartners || [],
        requestSample: (ep as any).requestSample ?? null,
        responseFormat: (ep as any).responseFormat ?? null,
        description: (ep as any).description ?? undefined,
        fields: (ep as any).fields ?? [],
      });
      endpointsByDoc.set(ep.documentId, list);
    });

    const projects = new Map<string, Project>();
    docs.forEach((doc) => {
      let project = projects.get(doc.projectId);
      if (!project) {
        project = {
          projectId: doc.projectId,
          projectName: doc.projectName,
          allowedPartners: (doc as any).allowedPartners || [],
          documents: [],
        };
        projects.set(doc.projectId, project);
      }
      project.documents.push({
        id: doc.id,
        title: doc.title,
        endpoints: endpointsByDoc.get(doc.id) || [],
      });
    });

    const result = Array.from(projects.values());
    if (!user || user.role === 'ADMIN') return result;

    const partnerId = user.partnerId ?? '';
    return result
      .filter((p) => p.allowedPartners.includes(partnerId))
      .map((p) => ({
        ...p,
        documents: p.documents
          .map((d) => ({
            ...d,
            endpoints: d.endpoints.filter((ep) =>
              ep.allowedPartners.includes(partnerId),
            ),
          }))
          .filter((d) => d.endpoints.length > 0),
      }))
      .filter((p) => p.documents.length > 0);
  }

  async setProjectPermission(
    partnerId: string,
    projectId: string,
    hasPermission: boolean,
  ) {
    const docs = await this.docModel.findAll({ where: { projectId } });
    if (docs.length === 0)
      throw new NotFoundException('Không tìm thấy Project');

    const next = this.applyPartnerToArray(
      (docs[0] as any).allowedPartners || [],
      partnerId,
      hasPermission,
    );

    await Promise.all(
      docs.map((doc) => doc.update({ allowedPartners: next } as any)),
    );

    return {
      success: true,
      projects: await this.getDocuments({ role: 'ADMIN' }),
    };
  }

  async setEndpointPermission(
    partnerId: string,
    endpointId: string,
    hasPermission: boolean,
  ) {
    const ep = await this.endpointModel.findByPk(endpointId);
    if (!ep) throw new NotFoundException('Không tìm thấy Endpoint');

    const next = this.applyPartnerToArray(
      (ep as any).allowedPartners || [],
      partnerId,
      hasPermission,
    );

    await ep.update({ allowedPartners: next });

    return {
      success: true,
      projects: await this.getDocuments({ role: 'ADMIN' }),
    };
  }

  private applyPartnerToArray(
    current: string[],
    partnerId: string,
    hasPermission: boolean,
  ): string[] {
    if (hasPermission && !current.includes(partnerId)) {
      return [...current, partnerId];
    }
    if (!hasPermission) {
      return current.filter((id) => id !== partnerId);
    }
    return current;
  }

  async uploadEndpoints(endpoints: unknown[]) {
    const uploadedProjectId = 'project-uploaded';
    const uploadedDocs = await this.docModel.findAll({
      where: { projectId: uploadedProjectId },
    });

    if (!Array.isArray(endpoints)) {
      return { success: false, message: 'Invalid endpoints payload' };
    }

    const categoryMap = new Map<string, Endpoint[]>();

    endpoints.forEach((rawEp) => {
      const ep = rawEp as Record<string, unknown>;
      const cat = String((ep['category'] as string) ?? 'CHUNG');
      const endpointId = String(
        (ep['id'] as string) ??
          (ep['endpointId'] as string) ??
          `uploaded-${Date.now()}-${Math.random().toString(36).slice(2, 8)}`,
      );
      const method = String((ep['method'] as string) ?? 'GET').toUpperCase();
      const pathStr = String((ep['path'] as string) ?? '/');
      const name = String((ep['name'] as string) ?? endpointId);
      const description = String((ep['description'] as string) ?? '');
      const requestSample =
        ep['requestSample'] !== undefined && ep['requestSample'] !== null
          ? (ep['requestSample'] as Record<string, unknown>)
          : null;
      const responseFormat =
        ep['responseFormat'] !== undefined && ep['responseFormat'] !== null
          ? (ep['responseFormat'] as Record<string, unknown>)
          : null;
      const fields = Array.isArray(ep['fields'])
        ? (ep['fields'] as unknown[])
        : [];

      const endpointObj: Endpoint = {
        endpointId,
        method,
        path: pathStr,
        name,
        allowedPartners: [],
        requestSample,
        responseFormat,
        description,
        fields,
      };

      if (!categoryMap.has(cat)) categoryMap.set(cat, []);
      categoryMap.get(cat)!.push(endpointObj);
    });

    let insertedCount = 0;
    const existingDocs = new Map(uploadedDocs.map((d) => [d.id, d]));

    for (const [catName, eps] of categoryMap) {
      const docId = `uploaded-doc-${catName.toLowerCase().replace(/[^a-z0-9]/g, '-')}`;
      let doc = existingDocs.get(docId);
      if (!doc) {
        doc = await this.docModel.create({
          id: docId,
          projectId: uploadedProjectId,
          projectName: 'APIs từ đối tác',
          title: catName.toUpperCase(),
          allowedPartners: [],
        } as any);
        existingDocs.set(docId, doc);
      }

      const existingIds = new Set(
        (
          await this.endpointModel.findAll({ where: { documentId: docId } })
        ).map((e) => e.endpointId),
      );
      const newEps = eps.filter((e) => !existingIds.has(e.endpointId));
      for (const newEp of newEps) {
        await this.endpointModel.create({
          ...newEp,
          documentId: docId,
        } as any);
      }
      insertedCount += newEps.length;
    }

    return { success: true, count: insertedCount };
  }

  async getUploadedEndpoints() {
    const docs = await this.docModel.findAll({
      where: { projectId: 'project-uploaded' },
    });
    if (docs.length === 0) return [];

    const endpoints = await this.endpointModel.findAll({
      where: {
        documentId: docs.map((d) => d.id),
      },
    });

    return endpoints.map((ep) => ({
      id: ep.endpointId,
      category: (docs.find((d) => d.id === ep.documentId) as any)?.title ?? '',
      method: ep.method,
      path: ep.path,
      name: ep.name,
      description: (ep as any).description ?? null,
      requestSample: (ep as any).requestSample ?? null,
      responseFormat: (ep as any).responseFormat ?? null,
      fields: (ep as any).fields ?? [],
    }));
  }
}
