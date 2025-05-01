import { useState, useEffect } from "react";
import { useNavigate } from "react-router-dom";
import { collectionGroup, getDocs, deleteDoc, doc } from "firebase/firestore";
import { db, auth } from "./firebase";
import TorneoCard from "./TorneoCard";

import "../styles/PanelTorneo.css";

const PanelTorneo = () => {
    const [torneos, setTorneos] = useState([]);
    const [loading, setLoading] = useState(true);
    const [currentPage, setCurrentPage] = useState(1);
    const [searchTerm] = useState("");
    const [userId, setUserId] = useState(null);
    const torneosPerPage = 2;
    const navigate = useNavigate();

    useEffect(() => {
        const fetchTorneos = async () => {
        try {
            const user = auth.currentUser;
            if (!user) {
            console.log("⚠️ No hay usuario autenticado");
            return;
            }
            setUserId(user.uid);

            const torneoDocs = await getDocs(collectionGroup(db, "Torneos"));
            const torneosData = torneoDocs.docs.map((doc, index) => {
            const data = doc.data();
            const fecha_inicio = data.fecha_inicio
                ? data.fecha_inicio.toDate().toLocaleDateString()
                : "Sin fecha";
            const fecha_fin = data.fecha_fin
                ? data.fecha_fin.toDate().toLocaleDateString()
                : "Sin fecha";

            return {
                id: doc.id,
                nombre_torneo: data.nombre_torneo,
                fecha_inicio,
                fecha_fin,
                color: ["#f4e1a7", "#a7daf4", "#d484e5"][index % 3],
                estado: data.estado || "En curso",
                creadorId: data.creadorId || null,
                userPath: doc.ref.path.split("/")[1], // para ruta de eliminación
            };
            });

            setTorneos(torneosData);
            setLoading(false);
        } catch (error) {
            console.error("❌ Error al obtener los torneos:", error);
            setLoading(false);
        }
        };

        fetchTorneos();
    }, []);

    const torneosFiltrados = torneos.filter((t) =>
        t.nombre_torneo.toLowerCase().includes(searchTerm.toLowerCase())
    );

    const indexOfLastTorneo = currentPage * torneosPerPage;
    const indexOfFirstTorneo = indexOfLastTorneo - torneosPerPage;
    const currentTorneos = torneosFiltrados.slice(
        indexOfFirstTorneo,
        indexOfLastTorneo
    );

    const nextPage = () => {
        if (indexOfLastTorneo < torneosFiltrados.length) {
        setCurrentPage(currentPage + 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const prevPage = () => {
        if (currentPage > 1) {
        setCurrentPage(currentPage - 1);
        window.scrollTo({ top: 0, behavior: "smooth" });
        }
    };

    const handleEdit = (id) => {
        navigate(`/editar-torneo/${id}`);
    };

    const handleDelete = async (id) => {
        const user = auth.currentUser;
        if (!user) return;

        try {
        const torneoRef = doc(db, `Users/${user.uid}/Torneos/${id}`);
        await deleteDoc(torneoRef);
        setTorneos((prev) => prev.filter((torneo) => torneo.id !== id));
        alert("✅ Torneo eliminado correctamente.");
        } catch (error) {
        console.error("❌ Error al eliminar torneo:", error);
        alert("❌ No se pudo eliminar el torneo.");
        }
    };

    const handleCardClick = (id) => {
        navigate(`/torneo/${id}`);
    };

    if (loading) return <p>🔄 Cargando torneos...</p>;

    return (
        <div className="torneos-container">
        <h1>🏆Torneo Disponibles</h1>
        <button className="btn-crear-torneo" onClick={() => navigate("/nuevo-torneo")}>
                    ➕ Crear Torneo
        </button>
        <div className="torneos-grid">
            {currentTorneos.length > 0 ? (
            currentTorneos.map((torneo) => (
                <div
                key={torneo.id}
                className="torneo-card-wrapper"
                onClick={() => handleCardClick(torneo.id)}
                style={{ cursor: "pointer" }}
                >
                <TorneoCard
                    id={torneo.id}
                    nombre={torneo.nombre_torneo}
                    fecha_inicio={torneo.fecha_inicio}
                    fecha_fin={torneo.fecha_fin}
                    color={torneo.color}
                    estado={torneo.estado}
                    onEdit={torneo.creadorId === userId ? handleEdit : null}
                    onDelete={torneo.creadorId === userId ? handleDelete : null}
                />
                </div>
            ))
            ) : (
            <p>❌ No hay torneos disponibles.</p>
            )}
        </div>

        <div className="pagination-buttons">
            <button onClick={prevPage} disabled={currentPage === 1}>
            ⬅️ Anterior
            </button>
            <button
            onClick={nextPage}
            disabled={indexOfLastTorneo >= torneosFiltrados.length}
            >
            Siguiente ➡️
            </button>
        </div>
        </div>
    );
};

export default PanelTorneo;
