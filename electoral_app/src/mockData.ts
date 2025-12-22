export interface Party {
    id: string;
    name: string;
    shortName: string;
    color: string;
    logo?: string;
}

export interface Coalition {
    id: string;
    name: string;
    memberIds: string[];
}

export interface Candidate {
    id: string;
    name: string;
    partyId: string;
    coalitionId?: string;
    photo?: string;
}

export interface RawResult {
    sectionId: string;
    casillaType: 'B' | 'C' | 'E' | 'S';
    votes: Record<string, number>; // Key can be partyId or coalition combo like 'pan_pri_prd'
}

export interface ElectionResult {
    partyId: string;
    votes: number;
    percentage: number;
}

export interface SectionData {
    id: string;
    colonia: string;
    municipality: string;
    nominalList: number;
    participation: number;
    results: ElectionResult[];
    nullVotes: number;
}

export interface ColoniaData {
    name: string;
    sections: string[];
    totalVotes: number;
    participation: number;
    results: ElectionResult[];
}

export const PARTIES: Party[] = [
    { id: 'morena', name: 'Morena', shortName: 'MORENA', color: '#B22222' },
    { id: 'pt', name: 'Partido del Trabajo', shortName: 'PT', color: '#FF0000' },
    { id: 'pvem', name: 'Partido Verde', shortName: 'PVEM', color: '#00FF00' },
    { id: 'pan', name: 'Partido Acción Nacional', shortName: 'PAN', color: '#0000FF' },
    { id: 'pri', name: 'Partido Revolucionario Institucional', shortName: 'PRI', color: '#008000' },
    { id: 'prd', name: 'Partido de la Revolución Democrática', shortName: 'PRD', color: '#FFFF00' },
    { id: 'mc', name: 'Movimiento Ciudadano', shortName: 'MC', color: '#FF8C00' },
];

export const COALITIONS: Coalition[] = [
    {
        id: 'sigamos_haciendo_historia',
        name: 'Sigamos Haciendo Historia',
        memberIds: ['morena', 'pt', 'pvem']
    },
    {
        id: 'fuerza_y_corazon',
        name: 'Fuerza y Corazón por México',
        memberIds: ['pan', 'pri', 'prd']
    }
];

/**
 * Logic to distribute coalition votes as specified in the PDF:
 * "La práctica estándar del INE para estadística es distribuir los votos de coalición igualitariamente entre los integrantes."
 */
export const distributeVotes = (rawVotes: Record<string, number>): ElectionResult[] => {
    const distributed: Record<string, number> = {};
    let totalVotes = 0;

    // Initialize parties
    PARTIES.forEach(p => distributed[p.id] = 0);

    Object.entries(rawVotes).forEach(([key, votes]) => {
        if (key === 'nulos' || key === 'no_registrados') return;

        totalVotes += votes;

        // Check if key is a coalition combo (e.g., 'pan_pri')
        const members = key.split('_');
        const validMembers = members.filter(m => PARTIES.some(p => p.id === m));

        if (validMembers.length > 0) {
            const votesPerMember = votes / validMembers.length;
            validMembers.forEach(m => {
                distributed[m] = (distributed[m] || 0) + votesPerMember;
            });
        } else if (distributed[key] !== undefined) {
            distributed[key] += votes;
        }
    });

    return Object.entries(distributed).map(([partyId, votes]) => ({
        partyId,
        votes,
        percentage: totalVotes > 0 ? (votes / totalVotes) * 100 : 0
    })).sort((a, b) => b.votes - a.votes);
};

// Realistic Mock Data for Section 1545 with Coalition Combinations
const rawVotes1545: Record<string, number> = {
    'morena': 600,
    'pt': 50,
    'pvem': 40,
    'morena_pt_pvem': 150,
    'morena_pt': 30,
    'pan': 280,
    'pri': 80,
    'prd': 40,
    'pan_pri_prd': 60,
    'pan_pri': 20,
    'mc': 90,
    'nulos': 45
};

export const MOCK_SECTIONS: SectionData[] = [
    {
        id: '1545',
        colonia: 'Eduardo Molina I',
        municipality: 'Gustavo A. Madero',
        nominalList: 2450,
        participation: 68.5,
        nullVotes: 45,
        results: distributeVotes(rawVotes1545)
    },
    {
        id: '1546',
        colonia: 'Eduardo Molina I',
        municipality: 'Gustavo A. Madero',
        nominalList: 2100,
        participation: 65.2,
        nullVotes: 38,
        results: distributeVotes({
            'morena': 500,
            'pt': 40,
            'pvem': 30,
            'morena_pt_pvem': 120,
            'pan': 200,
            'pri': 70,
            'prd': 30,
            'pan_pri_prd': 50,
            'mc': 70,
            'nulos': 38
        })
    },
    {
        id: '1234',
        colonia: 'Lindavista',
        municipality: 'Gustavo A. Madero',
        nominalList: 2800,
        participation: 72.1,
        nullVotes: 25,
        results: distributeVotes({
            'morena': 400,
            'pt': 20,
            'pvem': 20,
            'morena_pt_pvem': 80,
            'pan': 700,
            'pri': 150,
            'prd': 80,
            'pan_pri_prd': 120,
            'mc': 90,
            'nulos': 25
        })
    }
];

export const MOCK_COLONIAS: ColoniaData[] = [
    {
        name: 'Eduardo Molina I',
        sections: ['1545', '1546'],
        totalVotes: 3053,
        participation: 67.1,
        results: distributeVotes({
            'morena': 1100,
            'pt': 90,
            'pvem': 70,
            'morena_pt_pvem': 270,
            'morena_pt': 30,
            'pan': 480,
            'pri': 150,
            'prd': 70,
            'pan_pri_prd': 110,
            'pan_pri': 20,
            'mc': 160
        })
    },
    {
        name: 'Lindavista',
        sections: ['1234'],
        totalVotes: 2020,
        participation: 72.1,
        results: distributeVotes({
            'morena': 400,
            'pt': 20,
            'pvem': 20,
            'morena_pt_pvem': 80,
            'pan': 700,
            'pri': 150,
            'prd': 80,
            'pan_pri_prd': 120,
            'mc': 90
        })
    }
];

export const ELECTION_METADATA = {
    year: 2024,
    title: 'Proceso Electoral Concurrente 2023-2024',
    scope: 'Ciudad de México',
    municipality: 'Gustavo A. Madero',
    lastUpdate: '2024-06-10 18:45:00'
};
