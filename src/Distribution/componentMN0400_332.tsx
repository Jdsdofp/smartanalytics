// src/Distribution/componentMN0400_332.tsx

import { useEffect, useRef, useState } from 'react';
import * as echarts from 'echarts';
import { ClockIcon } from '@heroicons/react/24/outline';

interface DataItem {
    codigo: string;
    nome: string;
    serie: string;
    categoria: string;
    condicao: string;
    estado: string;
    ultimoVisto: string;
    custodia: string;
}

interface CustodyGroups {
    [custody: string]: {
        [category: string]: number[]; // [<30, 30-60, 60-90, >90]
    };
}

const csvData = `Codigo	Nome	Numero de Serie	Categoria	Condicao	ESTADO	Ultimo Visto	Custodia Designada	Zona Atual Codigo	Zona Atual Descricao	Codigo da TAG
NSG00105845	NESTING 9023	105845 - 902312711	NESTING 9023	EM USO	ENTRADA	2026-01-29 13:35:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00112791	PRJSOROCABA	000095 - 000000095	PRJ SOROCABA 	EM USO	ENTRADA	2026-01-29 13:25:05	NSG GROUP	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00107779	PRJ SOROCABA	000053 - 000053	PRJ SOROCABA 	EM USO	ENTRADA	2026-01-15 10:30:00	NSG GROUP	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00103284	NESTING 9074	103284 - 907401734	NESTING 9074	EM USO	ENTRADA	2025-12-20 08:15:00	NSG GROUP	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00100789	RM150	100789 - 150000149	RM150(MA222)	EM USO	ENTRADA	2025-11-10 14:20:00	NSG GROUP	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00100715	RM150	100715	RM150(MA222)	EM USO	ENTRADA	2026-01-25 09:00:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00100683	RM150	0683 - 150000043	RM150(MA222)	EM USO	ENTRADA	2026-01-20 11:30:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00100661	RM150	00021	RM150(MA222)	EM USO	ENTRADA	2025-12-28 15:45:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00100644	RM150	0644 - 150000004	RM150(MA222)	EM USO	ENTRADA	2025-11-15 08:30:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00100652	RM150	0652	RM150(MA222)	EM USO	ENTRADA	2025-10-20 12:00:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00108621	RM961	108621 - 096100034	RM961	EM USO	ENTRADA	2026-01-28 13:17:33	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00112423	RM961	- 096100077	RM961	EM USO	ENTRADA	2026-01-15 04:37:02	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00112460	RM961	112460 - 096100114	RM961	EM USO	ENTRADA	2025-12-10 08:20:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00108687	RM961	- 096100061	RM961	EM USO	ENTRADA	2025-11-05 10:15:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00112424	RM961	- 096100079	RM961	EM USO	ENTRADA	2025-10-15 14:30:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00100542	RM197	100542 - 019700511	RM197	EM USO	ENTRADA	2026-01-28 05:29:15	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00100449	RM197	100449 - 019700025	RM197	EM USO	ENTRADA	2026-01-20 20:27:37	GM	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00100467	RM197	100467 - 019700421	RM197	EM USO	ENTRADA	2026-01-10 15:20:00	GM	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00100195	RM197	0195 - 019700320	RM197	EM USO	ENTRADA	2025-12-25 11:30:00	GM	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00100399	RM197	100399 - 019700277	RM197	EM USO	ENTRADA	2025-12-05 09:45:00	GM	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00101131	RM197	264 - 019700264	RM197	EM USO	ENTRADA	2025-11-20 14:20:00	GM	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00100055	RM197	0055 - 019700263	RM197	EM USO	ENTRADA	2025-11-01 08:15:00	GM	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00115144	RM986	65	RM986	EM USO	ENTRADA	2026-01-29 04:37:03	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00110714	RM986	38	RM986	EM USO	ENTRADA	2026-01-22 10:15:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00115126	RM986	12	RM986	EM USO	ENTRADA	2026-01-10 14:30:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00110713	RM986	42	RM986	EM USO	ENTRADA	2025-12-28 09:20:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00113789	RM986	13	RM986	EM USO	ENTRADA	2025-12-15 11:45:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00107668	RM986	10	RM986	EM USO	ENTRADA	2025-11-25 08:30:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003622	RM113	3622 - 011300148	RM113	EM USO	ENTRADA	2026-01-29 04:37:02	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003624	RM113	3624 - 011300150	RM113	EM USO	ENTRADA	2026-01-20 12:30:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002037	RM113	2037 - 011300054	RM113	EM USO	ENTRADA	2026-01-05 09:15:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002034	RM113	2034 - 011300049	RM113	EM USO	ENTRADA	2025-12-20 14:45:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002108	RM114	2108 - 011400126	RM114	EM USO	ENTRADA	2026-01-29 04:37:01	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00001914	RM114	1914 - 011400101	RM114	EM USO	ENTRADA	2026-01-18 11:20:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003636	RM114	3636 - 011400324	RM114	EM USO	ENTRADA	2026-01-08 08:45:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002563	RM114	2563 - 011400033	RM114	EM USO	ENTRADA	2025-12-22 15:30:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002132	RM114	2132 - 011400043	RM114	EM USO	ENTRADA	2025-12-10 10:15:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002060	RM114	2060 - 011400008	RM114	EM USO	ENTRADA	2025-11-28 13:40:00	GM	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00117272	RM164	117272 - 016400135	RM164	EM USO	SAIU	2026-01-28 20:41:29	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00112363	RM164	52	RM164	EM USO	SAIU	2026-01-20 15:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00115707	RM164	298	RM164	EM USO	SAIU	2026-01-12 10:20:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117478	RM164	117478 - 016400164	RM164	EM USO	SAIU	2025-12-25 14:15:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117121	RM164	- 016400089	RM164	EM USO	SAIU	2025-12-10 09:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117119	RM164	- 016400087	RM164	EM USO	SAIU	2025-11-20 11:45:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117644	RM161	100417 - 016100417	RM161	EM USO	SAIU	2026-01-28 20:41:28	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117028	RM161	117028 - 016100243	RM161	EM USO	SAIU	2026-01-22 13:25:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117434	RM161		RM161	EM USO	SAIU	2026-01-15 09:40:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117412	RM161	117412 - 016100320	RM161	EM USO	SAIU	2026-01-08 14:20:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00116844	RM161	- 016100159	RM161	EM USO	SAIU	2025-12-28 10:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00116922	RM161	- 016100187	RM161	EM USO	SAIU	2025-12-18 15:45:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00116905	RM161	- 016100170	RM161	EM USO	SAIU	2025-12-05 08:20:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00116991	RM160	-050	RM160	EM USO	SAIU	2026-01-28 20:41:26	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117725	RM161	100464 - 016100464	RM161	EM USO	SAIU	2026-01-25 11:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117188	RM160	- 016000281	RM160	EM USO	SAIU	2026-01-20 14:15:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117704	RM160	117704 - 016000577	RM160	EM USO	SAIU	2026-01-15 09:40:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117374	RM160	117374 - 016000432	RM160	EM USO	SAIU	2026-01-10 13:20:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117293	RM160	- 016000351	RM160	EM USO	SAIU	2026-01-05 10:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117214	RM160	307	RM160	EM USO	SAIU	2025-12-28 15:45:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117608	RM160	00531 - 016000531	RM160	EM USO	SAIU	2025-12-20 09:20:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117338	RM160	117338 - 016000396	RM160	EM USO	SAIU	2025-12-12 14:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117361	RM160	117361	RM160	EM USO	SAIU	2025-12-05 11:15:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00116875	RM160	SID - 	RM160	EM USO	SAIU	2025-11-28 08:45:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00117342	RM160	117342 - 016000400	RM160	EM USO	SAIU	2025-11-20 13:30:00	FORD	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00107533	RM185	060	RM185	EM USO	ENTRADA	2026-01-29 12:08:39	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002668	RM185	2668	RM185	EM USO	ENTRADA	2026-01-25 10:20:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00104367	RM185	4367 - 018500123	RM185	EM USO	ENTRADA	2026-01-20 14:35:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00001506	RM185	1506 - 018500012	RM185	EM USO	ENTRADA	2026-01-15 09:15:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00001122	RM185	134 - 018500134	RM185	EM USO	ENTRADA	2026-01-08 11:40:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00002681	RM185	175	RM185	EM USO	ENTRADA	2025-12-28 15:20:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00000813	RM185	144 - 018500144	RM185	EM USO	ENTRADA	2025-12-20 08:30:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00000987	RM185	106	RM185	EM USO	ENTRADA	2025-12-10 13:45:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00113405	RM189	125	RM189	EM USO	ENTRADA	2026-01-29 12:50:48	VOLKSWAGEN	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00100089	RM188	059	RM188	EM USO	ENTRADA	2026-01-22 10:30:00	VOLKSWAGEN	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00100639	RM188	89	RM188	EM USO	ENTRADA	2026-01-15 14:20:00	VOLKSWAGEN	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00003354	RM189	3354 - 018900063	RM189	EM USO	ENTRADA	2026-01-08 09:45:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00001039	RM189	92 - 018900092	RM189	EM USO	ENTRADA	2025-12-28 11:30:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00001132	RM189	18 - 018900018	RM189	EM USO	ENTRADA	2025-12-18 15:15:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003357	RM189	111	RM189	EM USO	ENTRADA	2025-12-08 08:40:00	VOLKSWAGEN	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00105361	RM952	097	RM952	EM USO	ENTRADA	2026-01-29 06:34:34	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00105344	RM952	105344 - 095200003	RM952	EM USO	ENTRADA	2026-01-24 11:20:00	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00111191	RM952	111191 - 095200120	RM952	EM USO	ENTRADA	2026-01-18 14:30:00	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00111190	RM952	111190 - 095200119	RM952	EM USO	ENTRADA	2026-01-10 09:45:00	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00111179	RM952	111179 - 095200118	RM952	EM USO	ENTRADA	2025-12-25 13:20:00	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00112474	RM952	112474 - 095200078	RM952	EM USO	ENTRADA	2025-12-15 10:30:00	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003148	RM949	235	RM949	EM USO	ENTRADA	2026-01-28 22:09:12	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003199	RM949	3135	RM949	EM USO	ENTRADA	2026-01-20 15:40:00	HONDA	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003181	RM949	22/35	RM949	EM USO	ENTRADA	2026-01-12 11:20:00	HONDA	BR02ENT	BR02 - PORTAL DE ENTRADA	
NSG00112699	RM009	061	RM009	EM USO	SAIU	2026-01-29 06:26:52	HPE	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00112690	RM009	-052	RM009	EM USO	SAIU	2026-01-22 14:30:00	HPE	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00002513	RM009	2513 - 000911170	RM009	EM USO	SAIU	2026-01-15 09:20:00	HPE	BR01SAIDA	BR01 - PORTAL DE SAÍDA	
NSG00105735	RM013	100-0	RM013	EM USO	ENTRADA	2026-01-28 20:29:14	HPE	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00111812	RM013	111812 - 001300942	RM013	EM USO	ENTRADA	2026-01-20 11:45:00	HPE	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00110927	RM955	110927 - 095500237	RM955	EM USO	ENTRADA	2026-01-29 11:26:48	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003602	RM955	013	RM955	EM USO	ENTRADA	2026-01-22 09:30:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00113265	RM955	09002 - 095509002	RM955	EM USO	ENTRADA	2026-01-15 14:20:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00110256	RM955	110256 - 095500322	RM955	EM USO	ENTRADA	2026-01-08 10:45:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00110935	RM955	110935 - 095500245	RM955	EM USO	ENTRADA	2025-12-28 13:30:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003796	RM955	003796 - 095500090	RM955	EM USO	ENTRADA	2025-12-18 09:15:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00106284	RM957	112	RM957	EM USO	ENTRADA	2026-01-29 11:26:47	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00113252	RM957	12	RM957	EM USO	ENTRADA	2026-01-20 14:30:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00003772	RM957	20	RM957	EM USO	ENTRADA	2026-01-12 10:15:00	GM ROSÁRIO	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00016016	RM016	24	RM016	EM USO	ENTRADA	2026-01-28 20:29:15	RENAULT	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00016017	RM016	25	RM016	EM USO	ENTRADA	2026-01-18 11:40:00	RENAULT	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00016018	RM016	26	RM016	EM USO	ENTRADA	2026-01-08 15:20:00	RENAULT	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00016019	RM016	27	RM016	EM USO	ENTRADA	2025-12-22 09:30:00	RENAULT	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00115013	RM192	0187	RM192	EM USO	ENTRADA	2026-01-28 20:29:15	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00114990	RM192	176	RM192	EM USO	ENTRADA	2026-01-20 13:45:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA	
NSG00115010	RM192	208	RM192	EM USO	ENTRADA	2026-01-12 10:20:00	NSG GROUP	BR01ENT	BR01 - PORTAL DE ENTRADA`;

const custodyConfig = [
    { name: 'FORD', gradient: 'from-[#4A90E2] to-[#357ABD]' },
    { name: 'GM', gradient: 'from-[#F5A623] to-[#E08E00]' },
    { name: 'GM ROSÁRIO', gradient: 'from-[#50E3C2] to-[#2DB89A]' },
    { name: 'HONDA', gradient: 'from-[#7ED321] to-[#6AB01A]' },
    { name: 'HPE', gradient: 'from-[#5A5A5A] to-[#3A3A3A]' },
    { name: 'MAN', gradient: 'from-[#5AC8FA] to-[#3BA3D1]' },
    { name: 'RENAULT', gradient: 'from-[#BD10E0] to-[#9A0CB8]' },
    { name: 'VOLKSWAGEN', gradient: 'from-[#B8E986] to-[#95C662]' },
    { name: 'NSG GROUP', gradient: 'from-[#FF6B6B] to-[#E84A4A]' },
];

export default function PackagingDistribution() {
    //@ts-ignore
    const [data, setData] = useState<DataItem[]>([]);
    const [custodyGroups, setCustodyGroups] = useState<CustodyGroups>({});
    const [totalStats, setTotalStats] = useState<number[]>([0, 0, 0, 0]);
    const [updateTime, setUpdateTime] = useState<string>('');
    const chartRefs = useRef<{ [key: string]: HTMLDivElement | null }>({});

    // Parse CSV data
    const parseCSVData = (): DataItem[] => {
        const lines = csvData.trim().split('\n');
        const parsedData: DataItem[] = [];

        for (let i = 1; i < lines.length; i++) {
            const line = lines[i].trim();
            if (!line) continue;

            const parts = line.split('\t');
            if (parts.length >= 8) {
                parsedData.push({
                    codigo: parts[0],
                    nome: parts[1],
                    serie: parts[2],
                    categoria: parts[3],
                    condicao: parts[4],
                    estado: parts[5],
                    ultimoVisto: parts[6],
                    custodia: parts[7],
                });
            }
        }

        return parsedData;
    };

    // Calculate days since last seen
    const getDaysSinceLastSeen = (dateStr: string): number => {
        const lastSeen = new Date(dateStr);
        const now = new Date('2026-01-29');
        const diffTime = Math.abs(now.getTime() - lastSeen.getTime());
        const diffDays = Math.ceil(diffTime / (1000 * 60 * 60 * 24));
        return diffDays;
    };

    // Get age category
    const getAgeCategory = (days: number): number => {
        if (days < 30) return 0;
        if (days < 60) return 1;
        if (days < 90) return 2;
        return 3;
    };

    // Process data by custody
    const processData = (rawData: DataItem[]) => {
        const groups: CustodyGroups = {};
        const stats = [0, 0, 0, 0];

        rawData.forEach((item) => {
            const custody = item.custodia.trim();
            const category = item.categoria.trim();
            const lastSeen = item.ultimoVisto.trim();

            if (!custody || !category || !lastSeen) return;

            if (!groups[custody]) {
                groups[custody] = {};
            }

            if (!groups[custody][category]) {
                groups[custody][category] = [0, 0, 0, 0];
            }

            const days = getDaysSinceLastSeen(lastSeen);
            const ageCategory = getAgeCategory(days);

            groups[custody][category][ageCategory]++;
            stats[ageCategory]++;
        });

        setCustodyGroups(groups);
        setTotalStats(stats);
    };

    // Initialize data
    useEffect(() => {
        const parsedData = parseCSVData();
        setData(parsedData);
        processData(parsedData);

        const now = new Date();
        setUpdateTime(
            now.toLocaleString('pt-BR', {
                day: '2-digit',
                month: '2-digit',
                year: 'numeric',
                hour: '2-digit',
                minute: '2-digit',
                second: '2-digit',
            })
        );
    }, []);

    // Create charts
    useEffect(() => {
        if (Object.keys(custodyGroups).length === 0) return;

        custodyConfig.forEach((config) => {
            const categories = custodyGroups[config.name];
            if (!categories) return;

            const chartElement = chartRefs.current[config.name];
            if (!chartElement) return;

            const myChart = echarts.init(chartElement);

            // Prepare data
            const categoryNames = Object.keys(categories).sort((a, b) => {
                const totalA = categories[a].reduce((sum, val) => sum + val, 0);
                const totalB = categories[b].reduce((sum, val) => sum + val, 0);
                return totalB - totalA;
            });

            const series = [
                {
                    name: '<30 DIAS',
                    type: 'bar',
                    stack: 'total',
                    data: categoryNames.map((cat) => categories[cat][0]),
                    itemStyle: { color: '#5B9BD5' },
                    label: {
                        show: true,
                        position: 'inside',
                        fontSize: 11,
                        fontWeight: 'bold',
                        formatter: (params: any) => {
                            if (params.value > 0) {
                                const total = categories[params.name].reduce(
                                    (sum: number, val: number) => sum + val,
                                    0
                                );
                                const percentage = ((params.value / total) * 100).toFixed(0);
                                return `${params.value}\n(${percentage}%)`;
                            }
                            return '';
                        },
                    },
                },
                {
                    name: '30-60 DIAS',
                    type: 'bar',
                    stack: 'total',
                    data: categoryNames.map((cat) => categories[cat][1]),
                    itemStyle: { color: '#70AD47' },
                    label: {
                        show: true,
                        position: 'inside',
                        fontSize: 11,
                        fontWeight: 'bold',
                        formatter: (params: any) => {
                            if (params.value > 0) {
                                const total = categories[params.name].reduce(
                                    (sum: number, val: number) => sum + val,
                                    0
                                );
                                const percentage = ((params.value / total) * 100).toFixed(0);
                                return `${params.value}\n(${percentage}%)`;
                            }
                            return '';
                        },
                    },
                },
                {
                    name: '60-90 DIAS',
                    type: 'bar',
                    stack: 'total',
                    data: categoryNames.map((cat) => categories[cat][2]),
                    itemStyle: { color: '#FFC000' },
                    label: {
                        show: true,
                        position: 'inside',
                        fontSize: 11,
                        fontWeight: 'bold',
                        formatter: (params: any) => {
                            if (params.value > 0) {
                                const total = categories[params.name].reduce(
                                    (sum: number, val: number) => sum + val,
                                    0
                                );
                                const percentage = ((params.value / total) * 100).toFixed(0);
                                return `${params.value}\n(${percentage}%)`;
                            }
                            return '';
                        },
                    },
                },
                {
                    name: '>90 DIAS',
                    type: 'bar',
                    stack: 'total',
                    data: categoryNames.map((cat) => categories[cat][3]),
                    itemStyle: { color: '#A6A6A6' },
                    label: {
                        show: true,
                        position: 'inside',
                        fontSize: 11,
                        fontWeight: 'bold',
                        formatter: (params: any) => {
                            if (params.value > 0) {
                                const total = categories[params.name].reduce(
                                    (sum: number, val: number) => sum + val,
                                    0
                                );
                                const percentage = ((params.value / total) * 100).toFixed(0);
                                return `${params.value}\n(${percentage}%)`;
                            }
                            return '';
                        },
                    },
                },
            ];

            const option = {
                tooltip: {
                    trigger: 'axis',
                    axisPointer: {
                        type: 'shadow',
                    },
                    formatter: function (params: any) {
                        const categoryName = params[0].axisValue;
                        let total = 0;

                        params.forEach((param: any) => {
                            total += param.value || 0;
                        });

                        let result = `<div style="font-weight:bold; margin-bottom:8px; font-size:14px;">${categoryName}</div>`;
                        result += '<div style="margin-bottom:5px;">━━━━━━━━━━━━━━━━</div>';

                        params.forEach((param: any) => {
                            if (param.value > 0) {
                                const percentage = ((param.value / total) * 100).toFixed(1);
                                result += `<div style="margin:4px 0;">`;
                                result += `${param.marker} <span style="font-weight:600;">${param.seriesName}:</span> `;
                                result += `<span style="font-weight:bold;">${param.value}</span> `;
                                result += `<span style="color:#666;">(${percentage}%)</span>`;
                                result += `</div>`;
                            }
                        });

                        result += '<div style="margin:5px 0;">━━━━━━━━━━━━━━━━</div>';
                        result += `<div style="font-weight:bold; margin-top:5px;">Total: ${total} itens</div>`;

                        return result;
                    },
                },
                grid: {
                    left: '5%',
                    right: '5%',
                    bottom: '15%',
                    top: '10%',
                    containLabel: true,
                },
                xAxis: {
                    type: 'category',
                    data: categoryNames,
                    axisLabel: {
                        rotate: 45,
                        fontSize: 10,
                        interval: 0,
                    },
                },
                yAxis: {
                    type: 'value',
                    axisLabel: {
                        fontSize: 11,
                    },
                },
                legend: {
                    show: false,
                },
                series: series,
            };

            myChart.setOption(option);

            const handleResize = () => {
                myChart.resize();
            };

            window.addEventListener('resize', handleResize);

            return () => {
                window.removeEventListener('resize', handleResize);
                myChart.dispose();
            };
        });
    }, [custodyGroups]);

    return (
        <div className="min-h-screen bg-gray-50 p-4">
            <div className="max-w-[1600px] mx-auto">
                {/* Header */}
                <div className="bg-gradient-to-br from-[#1e3c72] to-[#2a5298] rounded-t-lg p-6 shadow-lg relative">
                    <h1 className="text-white text-4xl font-bold text-center mb-1 tracking-[2px]">
                        ONE PAGE REPORT
                    </h1>
                    <h2 className="text-[#a8d8ff] text-xl text-center tracking-wide">
                        EMBALAGEM
                    </h2>
                    <div className="absolute right-5 top-1/2 -translate-y-1/2 bg-white px-5 py-2.5 rounded-lg font-bold text-[#1e3c72] text-sm">
                        LOGÍSTICA
                    </div>
                </div>

                {/* Dashboard */}
                <div className="bg-white rounded-b-lg p-6 shadow-lg">
                    {/* Stats Summary */}
                    <div className="grid grid-cols-4 gap-4 mb-6 p-5 bg-gray-50 rounded-lg">
                        {[
                            { label: '<30 DIAS', color: 'text-[#5B9BD5]', value: totalStats[0] },
                            { label: '30-60 DIAS', color: 'text-[#70AD47]', value: totalStats[1] },
                            { label: '60-90 DIAS', color: 'text-[#FFC000]', value: totalStats[2] },
                            { label: '>90 DIAS', color: 'text-[#A6A6A6]', value: totalStats[3] },
                        ].map((stat, index) => (
                            <div
                                key={index}
                                className="text-center p-4 bg-white rounded-lg shadow-sm"
                            >
                                <div className={`text-3xl font-bold mb-1 ${stat.color}`}>
                                    {stat.value}
                                </div>
                                <div className="text-xs text-gray-600 uppercase">
                                    {stat.label}
                                </div>
                            </div>
                        ))}
                    </div>

                    {/* Charts Grid */}
                    <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-5">
                        {custodyConfig.map((config) => {
                            if (!custodyGroups[config.name]) return null;

                            return (
                                <div
                                    key={config.name}
                                    className="bg-white rounded-lg overflow-hidden shadow-md border border-gray-200"
                                >
                                    <div
                                        className={`bg-gradient-to-br ${config.gradient} text-white text-center font-bold text-lg py-4 px-4`}
                                    >
                                        {config.name}
                                    </div>
                                    <div className="bg-gray-50 text-center text-xs text-gray-600 py-1.5 px-2.5 border-b border-gray-200 italic">
                                        ↓ Cada barra mostra a distribuição por idade (dias desde
                                        última movimentação) ↓
                                    </div>
                                    <div
                                        ref={(el: any) => (chartRefs.current[config.name] = el)}
                                        className="w-full h-80 p-2.5"
                                    />
                                </div>
                            );
                        })}
                    </div>
                </div>

                {/* Footer */}
                <div className="bg-white p-5 rounded-lg mt-5 shadow-sm flex flex-wrap justify-between items-center gap-5">
                    <div className="flex items-center gap-2 text-sm font-semibold text-gray-800">
                        <ClockIcon className="w-5 h-5" />
                        <span>ATUALIZAÇÃO: {updateTime}</span>
                    </div>
                    <div className="flex flex-wrap gap-6">
                        {[
                            { label: '<30 DIAS', color: '#5B9BD5' },
                            { label: '30 - 60 DIAS', color: '#70AD47' },
                            { label: '60 - 90 DIAS', color: '#FFC000' },
                            { label: '>90 DIAS', color: '#A6A6A6' },
                        ].map((legend, index) => (
                            <div key={index} className="flex items-center gap-2">
                                <div
                                    className="w-12 h-5 rounded shadow-md"
                                    style={{ backgroundColor: legend.color }}
                                />
                                <span className="text-sm font-semibold">{legend.label}</span>
                            </div>
                        ))}
                    </div>
                </div>
            </div>
        </div>
    );
}