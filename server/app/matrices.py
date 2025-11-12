import networkx as nx
import matplotlib.pyplot as plt
from io import BytesIO
from pyverilog.vparser.parser import VerilogParser
from pyverilog.vparser.ast import Identifier, Pointer

class InstanceGraphBuilder:
    def __init__(self):
        self.instances = {}
        self.signal_to_producer = {}
        self.signal_to_consumers = {}
        self.graph = nx.DiGraph()

    def extract_signal_name(self, arg):
        if isinstance(arg, Identifier):
            return arg.name
        elif isinstance(arg, Pointer):
            return f"{arg.var.name}[{arg.ptr.value}]"
        return None

    def visit(self, node):
        if hasattr(node, 'children'):
            for child in node.children():
                self.visit(child)

        if node.__class__.__name__ == 'Instance':
            inst_name = node.name
            gate_type = node.module.upper()
            inputs = []
            outputs = []
            is_seq = gate_type in ['DFF', 'TFF', 'JKFF', 'SRFF', 'REG']

            for i, conn in enumerate(node.portlist):
                signal = self.extract_signal_name(conn.argname)
                portname = conn.portname.lower() if conn.portname else f'pos{i}'

                if signal:
                    if portname in ['y', 'q', 'out', 'z', 'pos0']:
                        outputs.append(signal)
                        self.signal_to_producer[signal] = inst_name
                    else:
                        inputs.append(signal)
                        self.signal_to_consumers.setdefault(signal, []).append(inst_name)

            self.instances[inst_name] = {
                "type": gate_type,
                "inputs": inputs,
                "outputs": outputs,
                "is_seq": is_seq
            }

    def build_graph(self):
        for inst in self.instances:
            self.graph.add_node(inst)

        for inst, info in self.instances.items():
            for input_signal in info["inputs"]:
                producer = self.signal_to_producer.get(input_signal)
                if producer:
                    self.graph.add_edge(producer, inst)

        return self.graph

def compute_logic_depths(graph, builder):
    depths = {}
    combinational_nodes = [node for node in graph.nodes if not builder.instances[node]['is_seq']]
    sequential_nodes = [node for node in graph.nodes if builder.instances[node]['is_seq']]

    for node in sequential_nodes:
        depths[node] = 0

    for node in nx.topological_sort(graph.subgraph(combinational_nodes)):
        preds = list(graph.predecessors(node))
        if not preds:
            depths[node] = 1
        else:
            depths[node] = 1 + max(depths[p] for p in preds)

    return depths

def analyze_verilog(verilog_code):
    try:
        parser = VerilogParser()
        ast = parser.parse(verilog_code)
    except Exception as e:
        print(f"Invalid Verilog code or parsing failed: {e}")
        return [], [], None, []

    try:
        builder = InstanceGraphBuilder()
        builder.visit(ast)
        G = builder.build_graph()

        # --- Check for empty or single-node graphs ---
        if len(G.nodes) <= 1:
            print("Please provide proper gate-level RTL code with adequate nodes.")
            return [], [], None, []

        # --- Check for node limit (max 8) ---
        if len(G.nodes) > 8:
            print("Supports only up to 8 nodes — skipping matrix and graph generation.")
            return [], [], None, []

        depths = compute_logic_depths(G, builder)

        instances = list(builder.instances.keys())
        instance_matrix = []

        for inst in instances:
            info = builder.instances[inst]
            fan_in = len(info["inputs"])
            fan_out = 0
            for output_signal in info["outputs"]:
                consumers = builder.signal_to_consumers.get(output_signal, [])
                fan_out += len(consumers) if consumers else 1
            depth = depths[inst]
            gate_type = info["type"]
            label_type = 'SEQ' if info["is_seq"] else 'COMB'
            instance_matrix.append([fan_in, fan_out, depth, gate_type, label_type])

        fea_matrix = instance_matrix
        adj_matrix = [[0] * len(instances) for _ in range(len(instances))]
        inst_index = {inst: idx for idx, inst in enumerate(instances)}

        for src, dst in G.edges():
            src_idx = inst_index[src]
            dst_idx = inst_index[dst]
            adj_matrix[src_idx][dst_idx] = 1

        # Plot as image in memory
        fig, ax = plt.subplots(figsize=(10, 6))
        color_map = ['lightgreen' if builder.instances[n]['is_seq'] else 'skyblue' for n in G.nodes]
        nx.draw(G, with_labels=True, node_color=color_map, node_size=2000, arrowsize=20, ax=ax)
        plt.title("Gate-Level Graph (with Sequential Support)")
        buf = BytesIO()
        plt.savefig(buf, format='png')
        buf.seek(0)

        return fea_matrix, adj_matrix, buf, instances  #Added instances here

    except Exception as e:
        print(f"Analysis error: {e}")
        return [], [], None, []