import * as babelParser from '@babel/parser';

const generateAstGraph = (code) => {
    let ast;
    try {
        ast = babelParser.parse(code, {
            sourceType: "module",
            plugins: ["typescript", "jsx"]
        });
    } catch (err) {
        throw new Error("Failed to parse code. Ensure it is valid JS/TS.");
    }

    const nodes = [];
    const edges = [];
    let nodeIdCounter = 1;

    // Simple auto-layout trackers
    let currentY = 50;

    const traverse = (node, parentId = null, depth = 0) => {
        if (!node || typeof node !== 'object') return;

        const importantTypes = [
            'FunctionDeclaration', 'VariableDeclaration', 'IfStatement',
            'ForStatement', 'WhileStatement', 'ExpressionStatement', 'ReturnStatement'
        ];

        let currentId = parentId;

        if (importantTypes.includes(node.type)) {
            currentId = `node_${nodeIdCounter++}`;
            
            let label = node.type;
            if (node.type === 'FunctionDeclaration' && node.id?.name) label += ` (${node.id.name})`;
            if (node.type === 'VariableDeclaration') label += ` (${node.kind})`;

            nodes.push({
                id: currentId,
                position: { x: 250 + (depth * 50), y: currentY }, 
                data: { label },
                style: { backgroundColor: 'var(--card-bg, #1f2937)', color: 'var(--text, #fff)', border: '1px solid var(--primary, #8b5cf6)', borderRadius: '8px', padding: '10px', fontSize: '12px' }
            });
            currentY += 70;

            if (parentId) {
                edges.push({
                    id: `edge_${parentId}_${currentId}`,
                    source: parentId,
                    target: currentId,
                    animated: true,
                    style: { stroke: 'var(--primary, #8b5cf6)' }
                });
            }
            depth += 1;
        }

        // Recursively traverse child properties
        for (const key in node) {
            if (key === 'loc' || key === 'start' || key === 'end' || key === 'comments') continue;
            const child = node[key];
            if (Array.isArray(child)) {
                child.forEach(c => traverse(c, currentId, depth));
            } else if (child && typeof child === 'object') {
                traverse(child, currentId, depth);
            }
        }
    };

    traverse(ast.program);
    return { nodes, edges };
};

export const getAst = async (req, res, next) => {
    try {
        const { code } = req.body;
        if (!code) return res.status(400).json({ error: "Code is required" });
        
        const graph = generateAstGraph(code);
        return res.status(200).json(graph);
    } catch (err) {
        return res.status(400).json({ error: err.message });
    }
};
