using System.Collections;
using UnityEngine;
using UnityEngine.AI;

public class WPGuidance : MonoBehaviour
{
    public GameObject WpGuidancePrefab;
    public Transform startPosition;
    public Transform destinationPosition;

    private GameObject createdWp;
    private NavMeshAgent agent;
    public float respawnDelay = 4f;

    void Start()
    {
        SpawnPrefab();
    }

    void SpawnPrefab()
    {
        createdWp = Instantiate(WpGuidancePrefab, startPosition.position, startPosition.rotation);

        agent = createdWp.GetComponent<NavMeshAgent>();
        if (agent == null)
        {
            Debug.LogError("WpGuidancePrefab must have a NavMeshAgent component!");
            return;
        }

        if (NavMesh.SamplePosition(destinationPosition.position, out NavMeshHit hit, 3f, NavMesh.AllAreas))
        {
            agent.destination = hit.position;
            StartCoroutine(DistanceReach());
        }
        else
        {
            Debug.LogError("Destination position is not on the NavMesh! Ensure it is within the NavMesh bounds.");
        }
    }

    IEnumerator DistanceReach()
    {
        while (Vector3.Distance(createdWp.transform.position, agent.destination) > 1f)
        {
            yield return null;
        }

        yield return new WaitForSeconds(respawnDelay);
        Destroy(createdWp);
        SpawnPrefab();
    }
}
