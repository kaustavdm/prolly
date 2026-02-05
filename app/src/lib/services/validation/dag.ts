import { db } from '$lib/db';
import type { Objective } from '$lib/models';

export interface DAGValidationResult {
	valid: boolean;
	message?: string;
	cycleNodes?: string[];
}

/**
 * Validates that adding prerequisites to an objective won't create a cycle.
 * Uses DFS with recursion stack tracking.
 */
export async function validatePrerequisites(
	objectiveId: string,
	newPrerequisites: string[],
	curriculumId: string
): Promise<DAGValidationResult> {
	// Self-reference check
	if (newPrerequisites.includes(objectiveId)) {
		return {
			valid: false,
			message: 'An objective cannot be its own prerequisite',
			cycleNodes: [objectiveId]
		};
	}

	// Get all objectives in the curriculum
	const allObjectives = await db.objectives
		.where('curriculumId')
		.equals(curriculumId)
		.and((o) => !o.deletedAt)
		.toArray();

	// Build adjacency map (objective -> its prerequisites)
	const adjacencyMap = new Map<string, string[]>();
	for (const obj of allObjectives) {
		if (obj.id === objectiveId) {
			adjacencyMap.set(obj.id, newPrerequisites);
		} else {
			adjacencyMap.set(obj.id, obj.prerequisites);
		}
	}

	// Cross-curriculum check
	const objectiveIds = new Set(allObjectives.map((o) => o.id));
	for (const prereqId of newPrerequisites) {
		if (!objectiveIds.has(prereqId)) {
			return {
				valid: false,
				message: 'Prerequisites must belong to the same curriculum'
			};
		}
	}

	// Cycle detection using DFS
	const visited = new Set<string>();
	const recursionStack = new Set<string>();

	function hasCycle(nodeId: string, path: string[]): string[] | null {
		if (recursionStack.has(nodeId)) {
			const cycleStart = path.indexOf(nodeId);
			return [...path.slice(cycleStart), nodeId];
		}
		if (visited.has(nodeId)) {
			return null;
		}

		visited.add(nodeId);
		recursionStack.add(nodeId);

		const prereqs = adjacencyMap.get(nodeId) || [];
		for (const prereqId of prereqs) {
			const cycle = hasCycle(prereqId, [...path, nodeId]);
			if (cycle) {
				return cycle;
			}
		}

		recursionStack.delete(nodeId);
		return null;
	}

	// Check for cycles starting from each objective
	for (const obj of allObjectives) {
		visited.clear();
		recursionStack.clear();
		const cycle = hasCycle(obj.id, []);
		if (cycle) {
			return {
				valid: false,
				message: 'Adding these prerequisites would create a circular dependency',
				cycleNodes: cycle
			};
		}
	}

	return { valid: true };
}

/**
 * Get topologically sorted objectives (prerequisites first).
 */
export async function getTopologicalOrder(curriculumId: string): Promise<Objective[]> {
	const objectives = await db.objectives
		.where('curriculumId')
		.equals(curriculumId)
		.and((o) => !o.deletedAt)
		.toArray();

	const inDegree = new Map<string, number>();
	const adjacency = new Map<string, string[]>();
	const objectiveMap = new Map<string, Objective>();

	for (const obj of objectives) {
		inDegree.set(obj.id, obj.prerequisites.length);
		adjacency.set(obj.id, []);
		objectiveMap.set(obj.id, obj);
	}

	// Build reverse adjacency (prereq -> dependents)
	for (const obj of objectives) {
		for (const prereqId of obj.prerequisites) {
			const dependents = adjacency.get(prereqId) || [];
			dependents.push(obj.id);
			adjacency.set(prereqId, dependents);
		}
	}

	// Kahn's algorithm
	const queue: string[] = [];
	const result: Objective[] = [];

	for (const [id, degree] of inDegree) {
		if (degree === 0) {
			queue.push(id);
		}
	}

	while (queue.length > 0) {
		const currentId = queue.shift()!;
		result.push(objectiveMap.get(currentId)!);

		for (const dependentId of adjacency.get(currentId) || []) {
			const newDegree = (inDegree.get(dependentId) || 0) - 1;
			inDegree.set(dependentId, newDegree);
			if (newDegree === 0) {
				queue.push(dependentId);
			}
		}
	}

	return result;
}
