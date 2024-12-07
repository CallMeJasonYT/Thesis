using System.Collections;
using System.Collections.Generic;
using UnityEngine;

[RequireComponent(typeof(CharacterController))]
[AddComponentMenu("Control Script/FPSInput")]

public class FPSInput : MonoBehaviour
{
    private CharacterController charController;

    public float speed = 5.0f;
    public float jumpSpeed = 8.0f;
    public float gravity = -9.8f;
    
    private int numberOfJumps;
    [SerializeField] private int maxJumps = 2;
    private Vector3 movement;

    void Start()
    {
        charController = GetComponent<CharacterController>();
        movement = Vector3.zero;
    }

    void Update()
    {
        movement.x = Input.GetAxis("Horizontal") * speed;
        movement.z = Input.GetAxis("Vertical") * speed;

        if (charController.isGrounded && maxJumps > 0)
        {
            numberOfJumps = 0;
            movement.y = 0;

            if (Input.GetButtonDown("Jump"))
            {
                movement.y = jumpSpeed;
                numberOfJumps++;
            }
        }
        else
        {
            if (Input.GetButtonDown("Jump") && numberOfJumps < maxJumps)
            {
                movement.y = jumpSpeed;
                numberOfJumps++;
            }
            movement.y += gravity * Time.deltaTime;
        }

        Vector3 finalMovement = transform.TransformDirection(movement) * Time.deltaTime;
        charController.Move(finalMovement);
    }
}
