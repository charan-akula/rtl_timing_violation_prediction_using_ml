from matrices import analyze_verilog
verilog_code="""
module balanced_logic(input clk, input [3:0] d, output q); wire n1,n2,n3,n4; NAND nand1(n1, d[0], d[1]); NAND nand2(n2, d[2], d[3]); NAND nand3(n3, n1, n2); NOT not1(n4, n3); REG r0(q, n4, clk, 1'b0); endmodule
"""
fea, adj, buf, instances = analyze_verilog(verilog_code)
# Print matrices
print("\nFeature Matrix:")
for row in fea:
    print(row)

print("\nAdjacency Matrix:")
for row in adj:
    print(row)

print(instances)
