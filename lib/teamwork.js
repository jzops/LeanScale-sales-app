/**
 * Teamwork API Client
 *
 * Provides methods for creating and managing clients, projects,
 * milestones, task lists, and tasks in Teamwork.
 *
 * Uses Basic Auth: API token as username, 'x' as password.
 * Site URL and token from environment variables.
 */

const SITE_URL = process.env.TEAMWORK_SITE_URL || 'https://leanscale3.teamwork.com';
const API_TOKEN = process.env.TEAMWORK_API_TOKEN || '';

function getAuthHeaders() {
  const encoded = Buffer.from(`${API_TOKEN}:x`).toString('base64');
  return {
    Authorization: `Basic ${encoded}`,
    'Content-Type': 'application/json',
  };
}

async function tw(method, path, body) {
  const url = `${SITE_URL}${path}`;
  const opts = {
    method,
    headers: getAuthHeaders(),
  };
  if (body) {
    opts.body = JSON.stringify(body);
  }

  const res = await fetch(url, opts);

  if (!res.ok) {
    const text = await res.text().catch(() => '');
    throw new Error(`Teamwork API ${method} ${path} failed: ${res.status} ${text}`);
  }

  // Some Teamwork endpoints return 201 with no body
  const contentType = res.headers.get('content-type') || '';
  if (contentType.includes('application/json')) {
    return res.json();
  }
  return {};
}

/**
 * Check if Teamwork credentials are configured
 */
export function isTeamworkConfigured() {
  return !!(SITE_URL && API_TOKEN);
}

// ============================================
// COMPANIES (Clients)
// ============================================

/**
 * Search for a company by name
 */
export async function findCompanyByName(name) {
  const data = await tw('GET', `/companies.json`);
  const companies = data.companies || [];
  return companies.find(
    (c) => c.name.toLowerCase() === name.toLowerCase()
  ) || null;
}

/**
 * Create a new company (client)
 */
export async function createCompany(name) {
  const data = await tw('POST', '/companies.json', {
    company: { name },
  });
  return data;
}

/**
 * Find or create a company by name. Returns { id, name }.
 */
export async function findOrCreateCompany(name) {
  const existing = await findCompanyByName(name);
  if (existing) {
    return { id: existing.id, name: existing.name, created: false };
  }
  const result = await createCompany(name);
  // Teamwork returns the ID in a header or in the response
  const companyId = result.id || result.companyId;
  return { id: companyId, name, created: true };
}

// ============================================
// PROJECTS
// ============================================

/**
 * Create a new project
 */
export async function createProject({
  name,
  description = '',
  companyId,
  startDate,
  endDate,
  categoryId,
}) {
  const project = {
    name,
    description,
    'use-tasks': true,
    'use-milestones': true,
  };

  if (companyId) project.companyId = String(companyId);
  if (startDate) project.startDate = formatTeamworkDate(startDate);
  if (endDate) project.endDate = formatTeamworkDate(endDate);
  if (categoryId) project.categoryId = String(categoryId);

  const data = await tw('POST', '/projects.json', { project });
  const projectId = data.id || extractIdFromHeaders(data);
  return {
    id: projectId,
    url: `${SITE_URL}/app/projects/${projectId}`,
  };
}

/**
 * Get project details
 */
export async function getProject(projectId) {
  const data = await tw('GET', `/projects/${projectId}.json`);
  return data.project || null;
}

// ============================================
// MILESTONES
// ============================================

/**
 * Create a milestone on a project
 */
export async function createMilestone({
  projectId,
  title,
  description = '',
  deadline,
  responsible,
}) {
  const milestone = {
    title,
    description,
  };

  if (deadline) milestone.deadline = formatTeamworkDate(deadline);
  if (responsible) milestone['responsible-party-ids'] = responsible;

  const data = await tw(
    'POST',
    `/projects/${projectId}/milestones.json`,
    { milestone }
  );
  return {
    id: data.milestoneId || data.id,
  };
}

// ============================================
// TASK LISTS
// ============================================

/**
 * Create a task list on a project, optionally linked to a milestone
 */
export async function createTaskList({
  projectId,
  name,
  description = '',
  milestoneId,
}) {
  const tasklist = {
    name,
    description,
  };

  if (milestoneId) tasklist['milestone-id'] = String(milestoneId);

  const data = await tw(
    'POST',
    `/projects/${projectId}/tasklists.json`,
    { 'todo-list': tasklist }
  );
  return {
    id: data.TASKLISTID || data.id,
  };
}

// ============================================
// TASKS
// ============================================

/**
 * Create a task in a task list
 */
export async function createTask({
  taskListId,
  content,
  description = '',
  startDate,
  dueDate,
  estimateMinutes,
  assignedTo,
  priority = 'medium',
}) {
  const task = {
    content,
    description,
    priority,
  };

  if (startDate) task['start-date'] = formatTeamworkDate(startDate);
  if (dueDate) task['due-date'] = formatTeamworkDate(dueDate);
  if (estimateMinutes) task['estimated-minutes'] = estimateMinutes;
  if (assignedTo) task['responsible-party-id'] = String(assignedTo);

  const data = await tw(
    'POST',
    `/tasklists/${taskListId}/tasks.json`,
    { 'todo-item': task }
  );
  return {
    id: data.id,
  };
}

/**
 * Create multiple tasks in a task list
 */
export async function createTasksBatch(taskListId, tasks) {
  const results = [];
  for (const task of tasks) {
    const result = await createTask({ taskListId, ...task });
    results.push(result);
  }
  return results;
}

// ============================================
// FULL SOW PUSH
// ============================================

/**
 * Push a complete SOW to Teamwork.
 *
 * Creates: company → project → milestones (per section) → task lists → tasks
 *
 * Returns a summary of everything created with IDs.
 */
export async function pushSowToTeamwork({
  customerName,
  sow,
  sections,
  templateTasks,
}) {
  const results = {
    company: null,
    project: null,
    milestones: [],
    taskLists: [],
    tasks: [],
  };

  // 1. Find or create company
  const company = await findOrCreateCompany(customerName);
  results.company = company;

  // 2. Calculate project dates from sections
  const allDates = sections
    .flatMap((s) => [s.start_date, s.end_date])
    .filter(Boolean);
  const startDate = allDates.length
    ? new Date(Math.min(...allDates.map((d) => new Date(d)))).toISOString()
    : null;
  const endDate = allDates.length
    ? new Date(Math.max(...allDates.map((d) => new Date(d)))).toISOString()
    : null;

  // 3. Create project
  const project = await createProject({
    name: sow.title,
    description: sow.content?.executive_summary || '',
    companyId: company.id,
    startDate,
    endDate,
  });
  results.project = project;

  // 4. Create milestones and task lists for each section
  for (const section of sections) {
    // Create milestone
    const milestone = await createMilestone({
      projectId: project.id,
      title: section.title,
      description: section.description || '',
      deadline: section.end_date || null,
    });
    results.milestones.push({ ...milestone, sectionId: section.id, title: section.title });

    // Create a task list for the section's deliverables
    if (section.deliverables && section.deliverables.length > 0) {
      const taskList = await createTaskList({
        projectId: project.id,
        name: `${section.title} — Deliverables`,
        milestoneId: milestone.id,
      });
      results.taskLists.push({ ...taskList, sectionId: section.id });

      // Create tasks from deliverables
      for (const deliverable of section.deliverables) {
        const task = await createTask({
          taskListId: taskList.id,
          content: deliverable,
          startDate: section.start_date || null,
          dueDate: section.end_date || null,
        });
        results.tasks.push({ ...task, deliverable });
      }
    }

    // Create task list from template tasks (if provided for this section)
    const sectionTemplate = templateTasks?.[section.id] || templateTasks?.['_default'] || [];
    if (sectionTemplate.length > 0) {
      const templateList = await createTaskList({
        projectId: project.id,
        name: `${section.title} — Implementation`,
        milestoneId: milestone.id,
      });
      results.taskLists.push({ ...templateList, sectionId: section.id, type: 'template' });

      for (const tmplTask of sectionTemplate) {
        const task = await createTask({
          taskListId: templateList.id,
          content: tmplTask.content || tmplTask.name || tmplTask,
          description: tmplTask.description || '',
          startDate: section.start_date || null,
          dueDate: section.end_date || null,
          estimateMinutes: tmplTask.estimateMinutes || null,
        });
        results.tasks.push({ ...task, template: true });
      }
    }
  }

  return results;
}

// ============================================
// HELPERS
// ============================================

/**
 * Format a date string to Teamwork's expected YYYYMMDD format
 */
function formatTeamworkDate(dateStr) {
  if (!dateStr) return null;
  const d = new Date(dateStr);
  const year = d.getFullYear();
  const month = String(d.getMonth() + 1).padStart(2, '0');
  const day = String(d.getDate()).padStart(2, '0');
  return `${year}${month}${day}`;
}

function extractIdFromHeaders(data) {
  // Teamwork sometimes returns the ID in different formats
  return data.TASKLISTID || data.milestoneId || data.companyId || data.id || null;
}
