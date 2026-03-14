import {
    Radar,
    RadarChart,
    PolarGrid,
    PolarAngleAxis,
    PolarRadiusAxis,
    ResponsiveContainer,
    Legend,
    Tooltip,
} from "recharts";

interface SkillData {
    skill: string;
    current: number;
    required: number;
}

interface SkillRadarChartProps {
    data: SkillData[];
}

export function SkillRadarChart({ data }: SkillRadarChartProps) {
    return (
        <div className="w-full h-[400px] mt-4">
            <ResponsiveContainer width="100%" height="100%">
                <RadarChart cx="50%" cy="50%" outerRadius="80%" data={data}>
                    <PolarGrid stroke="hsl(var(--border))" />
                    <PolarAngleAxis
                        dataKey="skill"
                        tick={{ fill: "hsl(var(--foreground))", fontSize: 12, className: "font-display" }}
                    />
                    <PolarRadiusAxis
                        angle={30}
                        domain={[0, 100]}
                        tick={{ fill: "hsl(var(--muted-foreground))" }}
                    />
                    <Radar
                        name="Current Level"
                        dataKey="current"
                        stroke="hsl(var(--destructive))"
                        fill="hsl(var(--destructive))"
                        fillOpacity={0.4}
                    />
                    <Radar
                        name="Required Level"
                        dataKey="required"
                        stroke="hsl(var(--primary))"
                        fill="hsl(var(--primary))"
                        fillOpacity={0.4}
                    />
                    <Tooltip
                        contentStyle={{
                            backgroundColor: "hsl(var(--card))",
                            borderColor: "hsl(var(--border))",
                            borderRadius: "0.5rem"
                        }}
                        itemStyle={{ color: "hsl(var(--foreground))" }}
                    />
                    <Legend wrapperStyle={{ paddingTop: "20px" }} />
                </RadarChart>
            </ResponsiveContainer>
        </div>
    );
}
