// Family Tree Visualization Script
let svg, g, zoom;
let currentView = 'horizontal';
let selectedMember = null;

// Initialize the tree
function initializeTree(treeData, relationships) {
    if (!treeData || treeData.length === 0) {
        document.getElementById('treeLoading').style.display = 'none';
        document.getElementById('noDataMessage').style.display = 'block';
        return;
    }
    
    // Store data globally
    window.treeData = treeData;
    window.relationships = relationships;
    
    // Set up SVG and zoom
    svg = d3.select("#familyTreeSvg");
    
    zoom = d3.zoom()
        .scaleExtent([0.1, 3])
        .on("zoom", function(event) {
            g.attr("transform", event.transform);
        });
    
    svg.call(zoom);
    
    g = svg.append("g");
    
    // Render the tree
    renderTree();
    
    // Hide loading
    document.getElementById('treeLoading').style.display = 'none';
    
    // Update statistics
    updateStatistics();
}

function renderTree() {
    // Clear existing content
    g.selectAll("*").remove();
    
    // Create a simple tree layout for demo
    const width = 800;
    const height = 600;
    const nodeWidth = 120;
    const nodeHeight = 80;
    
    // Calculate positions (simplified layout)
    const positions = calculateNodePositions(window.treeData, width, height, nodeWidth, nodeHeight);
    
    // Render connections first (so they appear behind nodes)
    renderConnections(positions);
    
    // Render nodes
    renderNodes(positions);
}

function calculateNodePositions(members, width, height, nodeWidth, nodeHeight) {
    const positions = [];
    const centerX = width / 2;
    const centerY = height / 2;
    
    // Simple grid layout for demo purposes
    const cols = Math.ceil(Math.sqrt(members.length));
    const rows = Math.ceil(members.length / cols);
    
    members.forEach((member, index) => {
        const col = index % cols;
        const row = Math.floor(index / cols);
        
        const x = (col - (cols - 1) / 2) * (nodeWidth + 40) + centerX;
        const y = (row - (rows - 1) / 2) * (nodeHeight + 60) + centerY;
        
        positions.push({
            ...member,
            x: x,
            y: y
        });
    });
    
    return positions;
}

function renderNodes(positions) {
    const nodes = g.selectAll(".node")
        .data(positions)
        .enter()
        .append("g")
        .attr("class", "node")
        .attr("transform", d => `translate(${d.x - 60}, ${d.y - 40})`)
        .style("cursor", "pointer")
        .on("click", function(event, d) {
            selectMember(d);
        });
    
    // Node background
    nodes.append("rect")
        .attr("width", 120)
        .attr("height", 80)
        .attr("rx", 8)
        .attr("class", d => `node-bg ${d.gender?.toLowerCase() || 'unknown'}`);
    
    // Member photo or icon
    nodes.append("circle")
        .attr("cx", 60)
        .attr("cy", 25)
        .attr("r", 15)
        .attr("fill", "#f8f9fa")
        .attr("stroke", "#dee2e6")
        .attr("stroke-width", 2);
    
    nodes.append("text")
        .attr("x", 60)
        .attr("y", 30)
        .attr("text-anchor", "middle")
        .attr("font-size", "12px")
        .attr("fill", "#6c757d")
        .text("👤");
    
    // Member name
    nodes.append("text")
        .attr("x", 60)
        .attr("y", 55)
        .attr("text-anchor", "middle")
        .attr("font-size", "11px")
        .attr("font-weight", "600")
        .text(d => `${d.firstName} ${d.lastName}`);
    
    // Birth year
    nodes.append("text")
        .attr("x", 60)
        .attr("y", 70)
        .attr("text-anchor", "middle")
        .attr("font-size", "9px")
        .attr("fill", "#6c757d")
        .text(d => d.dateOfBirth ? new Date(d.dateOfBirth).getFullYear() : "");
}

function renderConnections(positions) {
    // Render relationship lines based on relationships data
    if (!window.relationships) return;
    
    window.relationships.forEach(rel => {
        const primaryMember = positions.find(p => p.id === rel.primaryMemberId);
        const relatedMember = positions.find(p => p.id === rel.relatedMemberId);
        
        if (primaryMember && relatedMember) {
            g.append("line")
                .attr("x1", primaryMember.x)
                .attr("y1", primaryMember.y)
                .attr("x2", relatedMember.x)
                .attr("y2", relatedMember.y)
                .attr("stroke", getRelationshipColor(rel.relationshipType))
                .attr("stroke-width", 2)
                .attr("class", "relationship-line");
        }
    });
}

function getRelationshipColor(type) {
    const colors = {
        'Parent': '#28a745',
        'Child': '#28a745',
        'Spouse': '#dc3545',
        'Sibling': '#ffc107'
    };
    return colors[type] || '#6c757d';
}

function selectMember(member) {
    selectedMember = member;
    
    // Update member info panel
    const memberInfo = document.getElementById('memberInfo');
    if (memberInfo) {
        memberInfo.innerHTML = `
            <div class="text-center mb-3">
                <div class="member-avatar bg-primary text-white rounded-circle mx-auto mb-2 d-flex align-items-center justify-content-center" 
                     style="width: 60px; height: 60px;">
                    <i class="fas fa-user fa-lg"></i>
                </div>
                <h6>${member.firstName} ${member.middleName || ''} ${member.lastName}</h6>
            </div>
            <div class="member-details">
                ${member.dateOfBirth ? `<div class="mb-2"><strong>Born:</strong> ${new Date(member.dateOfBirth).toLocaleDateString()}</div>` : ''}
                ${member.gender ? `<div class="mb-2"><strong>Gender:</strong> ${member.gender}</div>` : ''}
                ${member.placeOfBirth ? `<div class="mb-2"><strong>Birth Place:</strong> ${member.placeOfBirth}</div>` : ''}
            </div>
            <div class="mt-3">
                <a href="/Family/MemberDetails/${member.id}" class="btn btn-primary btn-sm w-100">
                    <i class="fas fa-eye me-1"></i>View Full Profile
                </a>
            </div>
        `;
    }
    
    // Highlight selected node
    g.selectAll(".node").classed("selected", false);
    g.selectAll(".node").filter(d => d.id === member.id).classed("selected", true);
}

function updateStatistics() {
    if (!window.treeData) return;
    
    const males = window.treeData.filter(m => m.gender === 'Male').length;
    const females = window.treeData.filter(m => m.gender === 'Female').length;
    
    const maleCountEl = document.getElementById('maleCount');
    const femaleCountEl = document.getElementById('femaleCount');
    
    if (maleCountEl) maleCountEl.textContent = males;
    if (femaleCountEl) femaleCountEl.textContent = females;
}

// Tree control functions
function zoomIn() {
    if (svg) {
        svg.transition().duration(300).call(zoom.scaleBy, 1.5);
    }
}

function zoomOut() {
    if (svg) {
        svg.transition().duration(300).call(zoom.scaleBy, 0.67);
    }
}

function resetZoom() {
    if (svg) {
        svg.transition().duration(500).call(zoom.transform, d3.zoomIdentity);
    }
}

function searchMembers() {
    const searchInput = document.getElementById('memberSearch');
    if (!searchInput) return;
    
    const searchTerm = searchInput.value.toLowerCase();
    
    g.selectAll(".node")
        .classed("highlighted", false)
        .filter(d => {
            const fullName = `${d.firstName} ${d.middleName || ''} ${d.lastName}`.toLowerCase();
            return fullName.includes(searchTerm);
        })
        .classed("highlighted", searchTerm.length > 0);
}

function switchView(view) {
    currentView = view;
    renderTree();
    
    // Update button states
    document.querySelectorAll('[onclick*="switchView"]').forEach(btn => {
        btn.classList.remove('active');
    });
    if (event && event.target) {
        event.target.classList.add('active');
    }
}

function filterByGeneration(generation) {
    // Implementation for filtering by generation
    console.log('Filtering by generation:', generation);
}

function filterByGender(gender) {
    g.selectAll(".node")
        .style("opacity", gender === 'all' ? 1 : d => {
            return d.gender?.toLowerCase() === gender ? 1 : 0.3;
        });
}

function showAllGenerations() {
    g.selectAll(".node").style("opacity", 1);
    g.selectAll(".relationship-line").style("opacity", 1);
}

function collapseTree() {
    // Simple collapse animation
    g.selectAll(".node")
        .transition()
        .duration(500)
        .attr("transform", "translate(400, 300) scale(0.1)")
        .style("opacity", 0.1);
}

function expandTree() {
    renderTree();
}

function addRelationship() {
    if (selectedMember) {
        // Redirect to add relationship page
        window.location.href = `/Relationships/Create?memberId=${selectedMember.id}`;
    } else {
        alert('Please select a family member first');
    }
}

function exportTree() {
    // Simple export functionality
    const svgElement = document.getElementById('familyTreeSvg');
    if (!svgElement) return;
    
    const svgData = new XMLSerializer().serializeToString(svgElement);
    const canvas = document.createElement('canvas');
    const ctx = canvas.getContext('2d');
    const img = new Image();
    
    canvas.width = 800;
    canvas.height = 600;
    
    img.onload = function() {
        ctx.drawImage(img, 0, 0);
        const link = document.createElement('a');
        link.download = 'family_tree.png';
        link.href = canvas.toDataURL();
        link.click();
    };
    
    img.src = 'data:image/svg+xml;base64,' + btoa(svgData);
}

function printTree() {
    window.print();
}

// Keyboard shortcuts
document.addEventListener('keydown', function(e) {
    if (e.ctrlKey || e.metaKey) {
        switch(e.key) {
            case '=':
            case '+':
                e.preventDefault();
                zoomIn();
                break;
            case '-':
                e.preventDefault();
                zoomOut();
                break;
            case '0':
                e.preventDefault();
                resetZoom();
                break;
        }
    }
});

// Export functions for global use
window.initializeTree = initializeTree;
window.zoomIn = zoomIn;
window.zoomOut = zoomOut;
window.resetZoom = resetZoom;
window.searchMembers = searchMembers;
window.switchView = switchView;
window.filterByGeneration = filterByGeneration;
window.filterByGender = filterByGender;
window.showAllGenerations = showAllGenerations;
window.collapseTree = collapseTree;
window.expandTree = expandTree;
window.addRelationship = addRelationship;
window.exportTree = exportTree;
window.printTree = printTree;