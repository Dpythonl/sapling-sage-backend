def survival_check(aligned_data):
    total = len(aligned_data)
    survivors = total - 1

    return {
        "total_pits": total,
        "survivors": survivors,
        "survival_rate": round((survivors / total) * 100, 2),
        "casualties": aligned_data[-1:]
    }
